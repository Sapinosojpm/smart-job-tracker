import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const ADMIN_EMAILS = ['sapinosojpm@gmail.com', 'sapinosomille@gmail.com'];

async function isAdminAuthorized() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return false;

    const envAdminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);

    const email = user.email.toLowerCase();
    return (
      envAdminEmails.includes(email) || 
      email === 'sapinosojpm@gmail.com' || 
      email === 'sapinosomille@gmail.com' || 
      ADMIN_EMAILS.includes(email)
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ success: false, error: 'userId and plan are required' }, { status: 400 });
    }

    if (!['FREE', 'PRO', 'TEAM'].includes(plan)) {
      return NextResponse.json({ success: false, error: 'Invalid plan value' }, { status: 400 });
    }

    // Check if the user settings exist
    const settings = await prisma.settings.findUnique({
      where: { userId }
    });

    if (!settings) {
      return NextResponse.json({ success: false, error: 'User settings record not found' }, { status: 444 });
    }

    // Update settings
    const updatedSettings = await prisma.settings.update({
      where: { userId },
      data: { plan }
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings
    });
  } catch (error: any) {
    console.error('[ADMIN_PLAN_UPDATE_API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
