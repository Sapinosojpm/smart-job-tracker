import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Verify ownership
    const existing = await prisma.application.findFirst({
      where: { id, userId: user.id }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Application not found or unauthorized' }, { status: 404 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: body,
    });
    
    return NextResponse.json({ success: true, data: application });
  } catch (err: any) {
    console.error('[APPLICATION_PATCH] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // 1. Find the application and verify ownership
    const application = await prisma.application.findFirst({
      where: { id, userId: user.id },
      select: { id: true, jobId: true }
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found or unauthorized' }, { status: 404 });
    }

    // 2. Delete the application
    await prisma.application.delete({
      where: { id: application.id },
    });
    
    // 3. Reset the job's isApplied status (if the job also belongs to the user)
    await prisma.job.update({
      where: { id: application.jobId, userId: user.id },
      data: { isApplied: false }
    });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[APPLICATION_DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete application' }, { status: 500 });
  }
}
