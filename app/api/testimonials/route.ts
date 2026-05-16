import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/utils/supabase/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await req.json();
    const { name, role, content, rating } = body;

    if (!name || !content) {
      return NextResponse.json({ success: false, error: 'Name and content are required' }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        userId: user?.id || null,
        name,
        role: role || 'Job Seeker',
        content,
        rating: rating || 5,
      },
    });

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Testimonial Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to post testimonial' }, { status: 500 });
  }
}
