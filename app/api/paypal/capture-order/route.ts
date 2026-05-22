import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Secret is not configured.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error_description || 'Failed to obtain PayPal access token.');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json({ success: false, error: 'Missing PayPal Order ID' }, { status: 400 });
    }

    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    // 1. Get Access Token
    const accessToken = await getPayPalAccessToken();

    // 2. Capture the order payment via PayPal
    const captureResponse = await fetch(`${apiUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      throw new Error(errorData.message || 'Failed to capture PayPal order payment.');
    }

    const captureData = await captureResponse.json();

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: `PayPal payment capture status is: ${captureData.status}`,
      }, { status: 400 });
    }

    // 3. Retrieve metadata custom_id to upgrade user plan
    const purchaseUnit = captureData.purchase_units?.[0];
    const customIdStr = purchaseUnit?.custom_id;

    if (!customIdStr) {
      throw new Error('PayPal payment captured but custom metadata was missing.');
    }

    const { userId, plan } = JSON.parse(customIdStr);

    if (!userId || (plan !== 'PRO' && plan !== 'TEAM')) {
      throw new Error('Invalid metadata custom_id structure in PayPal order.');
    }

    // 4. Update the plan in database
    await prisma.settings.update({
      where: { userId },
      data: { plan },
    });

    console.log(`Plan successfully updated for user ${userId} to ${plan} via PayPal order ${orderID}`);

    return NextResponse.json({
      success: true,
      plan: plan,
    });
  } catch (error: any) {
    console.error('[PAYPAL_CAPTURE_ORDER_ERROR]', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error',
    }, { status: 500 });
  }
}
