import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log(`[APPLICATION_PATCH] Updating ${id} with:`, body);
    
    const application = await prisma.application.update({
      where: { id },
      data: body,
    });
    
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }
    
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
    const { id } = await params;
    
    // 1. Find the application to get the jobId
    const application = await prisma.application.findUnique({
      where: { id },
      select: { jobId: true }
    });

    if (application) {
      // 2. Delete the application
      await prisma.application.delete({
        where: { id },
      });
      
      // 3. Reset the job's isApplied status
      await prisma.job.update({
        where: { id: application.jobId },
        data: { isApplied: false }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[APPLICATION_DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete application' }, { status: 500 });
  }
}
