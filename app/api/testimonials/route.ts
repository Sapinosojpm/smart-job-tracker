import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/utils/supabase/server';

const prisma = new PrismaClient();

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
      email === 'sapinosomille@gmail.com'
    );
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const isAdminRequested = url.searchParams.get('admin') === 'true';
    const isAuthorizedAdmin = isAdminRequested && (await isAdminAuthorized());

    const testimonials = await prisma.testimonial.findMany({
      where: isAuthorizedAdmin ? {} : {
        OR: [
          { role: { startsWith: '[Suggestion:' } },
          { approved: true }
        ]
      },
      orderBy: { createdAt: 'desc' },
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
        approved: false, // Set to false so it requires admin review first!
      },
    });

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Testimonial Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to post testimonial' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await isAdminAuthorized())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, approved, action } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });
    }

    if (action === 'delete') {
      await prisma.testimonial.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Testimonial deleted successfully' });
    } else {
      const updated = await prisma.testimonial.update({
        where: { id },
        data: { approved: approved !== undefined ? approved : true },
      });
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error: any) {
    console.error('Failed to update testimonial:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update testimonial' }, { status: 500 });
  }
}
