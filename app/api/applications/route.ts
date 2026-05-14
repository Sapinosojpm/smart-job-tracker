import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { applicationDate: 'desc' }
    });
    return NextResponse.json({ success: true, data: applications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, ...rest } = body;

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId: user.id }
    });

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found or unauthorized' }, { status: 404 });
    }
    
    const application = await prisma.application.create({
      data: {
        ...rest,
        userId: user.id,
        // applicationDate needs to be a Date object if provided as string
        applicationDate: body.applicationDate ? new Date(body.applicationDate) : new Date(),
        job: {
          connect: { id: jobId }
        }
      }
    });
    
    // Also mark the job as applied in the Job model
    await prisma.job.update({
      where: { id: jobId },
      data: { isApplied: true }
    });
    
    return NextResponse.json({ success: true, data: application });
  } catch (err: any) {
    console.error('[APPLICATION_POST]', err);
    return NextResponse.json({ success: false, error: 'Failed to create application entry' }, { status: 500 });
  }
}
