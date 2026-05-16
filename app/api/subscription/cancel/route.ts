import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Downgrade user to FREE plan
    await prisma.settings.update({
      where: { userId: user.id },
      data: { plan: 'FREE' }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription canceled successfully. You have been downgraded to the Free plan.' 
    });
  } catch (error: any) {
    console.error('[CANCEL_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
