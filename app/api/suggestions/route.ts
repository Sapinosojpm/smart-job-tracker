import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const body = await req.json();
    const { category, title, content, priority } = body;

    if (!category || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Category, title, and content are required' },
        { status: 400 }
      );
    }

    const priorityLabel = priority === 'Critical' ? 5 : priority === 'Important' ? 3 : 1;

    // We store the suggestion cleanly inside our existing Testimonial table.
    // We map the category and title to "role" in the format "[Suggestion: <Category>] <Title>".
    // We map the priority level (Nice to Have = 1, Important = 3, Critical = 5) to the rating scale.
    const suggestion = await prisma.testimonial.create({
      data: {
        userId: user?.id || null,
        name: user?.email || 'Anonymous User',
        role: `[Suggestion: ${category}] ${title}`,
        content: content,
        rating: priorityLabel,
      },
    });

    return NextResponse.json({ success: true, data: suggestion });
  } catch (error: any) {
    console.error('Failed to submit suggestion:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit suggestion' },
      { status: 500 }
    );
  }
}
