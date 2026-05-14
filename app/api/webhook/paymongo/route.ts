import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('paymongo-signature');
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // PayMongo signature verification
  const [timestampPart, signaturePart] = signature.split(',');
  const timestamp = timestampPart.split('=')[1];
  const signatureValue = signaturePart.split('=')[1];

  const baseString = timestamp + body;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(baseString)
    .digest('hex');

  if (signatureValue !== expectedSignature) {
    console.error('Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(body);
  const eventType = payload.data.attributes.type;

  if (eventType === 'checkout_session.payment_paid') {
    const checkoutSession = payload.data.attributes.data;
    const metadata = checkoutSession.attributes.metadata;
    const userId = metadata?.userId;
    const plan = metadata?.plan as 'PRO' | 'TEAM';

    if (userId && plan) {
      try {
        await prisma.settings.update({
          where: { userId },
          data: { plan }
        });
        console.log(`Plan updated for user ${userId} to ${plan} via PayMongo`);
      } catch (error) {
        console.error('Database update failed:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
