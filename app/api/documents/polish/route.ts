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
    const { type, resumeData, letterData } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Gemini API Key is not configured on the server.' }, { status: 500 });
    }

    let prompt = '';
    if (type === 'resume') {
      prompt = `You are an elite professional resume writer and career consultant.
Your task is to review and "AI Polish" the following resume details to make them exceptionally impressive, highlight impact, use strong action verbs, and adopt a highly premium professional tone.

Resume Details to Polish:
${JSON.stringify(resumeData, null, 2)}

Instructions:
1. Make the 'summary' punchy, inspiring, and aligned with industry best practices.
2. Refine the experience bullet points. Each bullet should be polished to show accomplishments, metrics (if plausible), and clear engineering value.
3. Improve projects bullet points to emphasize technical difficulty and outcomes.
4. Keep the output structure EXACTLY the same as the input JSON.
5. Return ONLY a valid JSON object matching the exact keys: fullName, location, email, phone, github, linkedin, summary, skills (languages, frontend, backend, databases, tools, other, concepts), experience (array of objects with title, company, date, bullets), projects (array of objects with name, link, bullets), education (array of objects with degree, school, date). Do not enclose in markdown code blocks or add any additional text.`;
    } else if (type === 'cover-letter') {
      prompt = `You are an elite career consultant writing a tailored cover letter.
Candidate details:
- Name: ${resumeData.fullName}
- Skills: ${JSON.stringify(resumeData.skills)}
- Experience Highlights: ${resumeData.experience.map((e: any) => `${e.title} at ${e.company}`).join(', ')}

Target Position:
- Role: ${letterData.role}
- Company: ${letterData.company}
- Recipient: ${letterData.recipient}

${letterData.jobDescription ? `Job Description / Post Details:\n${letterData.jobDescription}\n` : ''}

Write a persuasive, highly professional, and compelling cover letter tailored specifically to align the candidate's skills with the target position and the details of the job post provided above. Keep it authentic, engaging, and professional. 
Return ONLY the written cover letter body text paragraphs. Do not include markdown headers, subject lines, greeting salutations, or sign-offs. Just output the clean body content paragraphs.`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid document type.' }, { status: 400 });
    }

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

    if (type === 'resume') {
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

      const parsedResume = JSON.parse(cleanJson);
      return NextResponse.json({ success: true, data: parsedResume });
    } else {
      return NextResponse.json({ success: true, data: generatedText.trim() });
    }

  } catch (error: any) {
    console.error('AI Polish API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
