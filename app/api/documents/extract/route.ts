import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const currentSettings = await prisma.settings.findUnique({ where: { userId: user.id } });
    const userPlan = currentSettings?.plan || 'FREE';
    if (userPlan !== 'TEAM') {
      return NextResponse.json({ success: false, error: 'AI Features require the ELITE plan.' }, { status: 403 });
    }

    const body = await request.json();
    const { jobDescription } = body;

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ success: false, error: 'Job description is empty.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini API Key is not configured on the server.' }, { status: 500 });
    }

    const prompt = `You are an expert recruitment assistant.
Analyze the following job description/post details and extract structured information.

Job Post Details:
"""
${jobDescription}
"""

Instructions:
1. Extract the following fields:
   - role: The job title/role (e.g. "Full Stack React Js/Angular/.Net Core developer").
   - company: The company name hiring for this position. If the company name is not mentioned, confidential, or unclear, return an empty string "". Do NOT invent a name or use placeholders.
   - recipient: The hiring manager, recruiter, or hiring team name (e.g., "Hiring Manager", "Recruiting Team") if mentioned, otherwise default to "Hiring Manager".
   - salary: The salary/compensation range or hourly rate if specified (e.g. "$18 per hour"). If not specified, return an empty string "".
   - hoursPerWeek: The weekly hours required if specified (e.g., "40"). If not specified, return an empty string "".
   - workType: The type of work if specified (e.g., "Full Time", "Part Time", "Contract"). If not specified, return an empty string "".
   - skills: Up to 5 key technologies/skills required for this role as a comma-separated string (e.g., "React, Angular, .Net Core").

2. Return ONLY a valid JSON object matching the exact keys: role, company, recipient, salary, hoursPerWeek, workType, skills.
3. Do not enclose the output in markdown code blocks. Return ONLY the raw JSON string.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API call failed');
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No content returned from Gemini.');
    }

    // Clean potential markdown formatting
    let cleanJson = generatedText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json({ success: true, data: parsedData });
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', cleanJson, parseError);
      return NextResponse.json({ success: false, error: 'AI did not return valid JSON. Please try again.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('AI Extract API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
