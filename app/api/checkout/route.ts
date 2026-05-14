import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();
    
    if (plan !== 'PRO' && plan !== 'TEAM') {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    // Prices in Centavos (PHP 1.00 = 100)
    const amount = plan === 'PRO' ? 29900 : 79900; 
    const planName = plan === 'PRO' ? 'Pro Plan' : 'Team Plan';

    const options = {
      method: 'POST',
      url: 'https://api.paymongo.com/v1/checkout_sessions',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Basic ${Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64')}`
      },
      data: {
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            line_items: [
              {
                currency: 'PHP',
                amount: amount,
                description: `Upgrade to ${planName}`,
                name: planName,
                quantity: 1
              }
            ],
            payment_method_types: ['card', 'gcash', 'paymaya'],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs?canceled=true`,
            metadata: {
              userId: user.id,
              plan: plan
            }
          }
        }
      }
    };

    const response = await axios.request(options);
    const checkoutUrl = response.data.data.attributes.checkout_url;

    return NextResponse.json({ success: true, url: checkoutUrl });
  } catch (error: any) {
    console.error('[PAYMONGO_ERROR]', error.response?.data || error.message);
    const errorMessage = error.response?.data?.errors?.[0]?.detail || error.message;
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

