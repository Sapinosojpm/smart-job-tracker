import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { visitorId, path } = await request.json();
    if (!visitorId || !path) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    await prisma.pageView.create({
      data: {
        visitorId,
        path,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[TRACK_API] Error tracking page view:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
