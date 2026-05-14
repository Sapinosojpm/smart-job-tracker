import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (jobs.length === 0) {
    return NextResponse.json({ error: 'No jobs found' }, { status: 404 });
  }

  // Generate CSV content
  const headers = ['Title', 'Company', 'Link', 'Source', 'Location', 'Salary', 'Posted At', 'Status'];
  const rows = jobs.map(j => [
    `"${j.title.replace(/"/g, '""')}"`,
    `"${j.company.replace(/"/g, '""')}"`,
    `"${j.link}"`,
    `"${j.source}"`,
    `"${j.location || ''}"`,
    `"${j.salary || ''}"`,
    j.postedAt ? j.postedAt.toISOString() : '',
    j.isApplied ? 'Applied' : 'New'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="smart-job-tracker-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
