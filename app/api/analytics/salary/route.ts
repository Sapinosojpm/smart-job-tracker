import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get average salary by job title for the user
  const jobs = await prisma.job.findMany({
    where: { 
      userId: user.id,
      salaryMin: { not: null }
    },
    select: {
      title: true,
      salaryMin: true,
      salaryMax: true,
      currency: true
    }
  });

  if (jobs.length === 0) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Basic aggregation: group by title keyword (e.g. "React")
  const stats: Record<string, { count: number, total: number }> = {};

  jobs.forEach(j => {
    const avg = ((j.salaryMin || 0) + (j.salaryMax || j.salaryMin || 0)) / 2;
    const key = j.title.split(' ')[0].toLowerCase(); // Simplified grouping
    
    if (!stats[key]) {
      stats[key] = { count: 0, total: 0 };
    }
    stats[key].count++;
    stats[key].total += avg;
  });

  const data = Object.keys(stats).map(key => ({
    category: key,
    averageSalary: Math.round(stats[key].total / stats[key].count),
    count: stats[key].count
  })).sort((a, b) => b.count - a.count);

  return NextResponse.json({ success: true, data });
}
