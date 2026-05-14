import nodemailer from 'nodemailer';
import { getAppSettings } from './settings';

interface JobAlert {
  title: string;
  company: string;
  link: string;
  source: string;
  location?: string;
}

async function createTransporter(settings: any) {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: settings.emailUser,
      pass: settings.emailPass,
    },
  });
}

function buildEmailHtml(jobs: JobAlert[]): string {
  const jobRows = jobs
    .map(
      (job) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px;">
            <a href="${job.link}" style="color: #6366f1; text-decoration: none; font-weight: 600;">
              ${job.title}
            </a>
          </td>
          <td style="padding: 12px 8px; color: #374151;">${job.company}</td>
          <td style="padding: 12px 8px; color: #6b7280;">${job.location || 'N/A'}</td>
          <td style="padding: 12px 8px;">
            <span style="background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 9999px; font-size: 12px;">
              ${job.source}
            </span>
          </td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>New Job Alerts – Smart Job Tracker</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; padding: 32px;">
      <div style="max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 28px 32px;">
          <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 700;">
            Smart Job Tracker
          </h1>
          <p style="margin: 6px 0 0; color: #c7d2fe; font-size: 14px;">
            ${jobs.length} new job${jobs.length > 1 ? 's' : ''} found matching your criteria
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 24px 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Job Title</th>
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Company</th>
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Location</th>
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Source</th>
              </tr>
            </thead>
            <tbody>
              ${jobRows}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
            Smart Job Tracker Alert System • You received this because you configured email alerts.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendNewJobsEmail(userId: string, jobs: JobAlert[]): Promise<void> {
  const settings = await getAppSettings(userId);

  if (!settings.emailUser || !settings.emailPass || !settings.emailTo) {
    console.log('[Email] Skipping — email credentials not configured in settings');
    return;
  }

  const transporter = await createTransporter(settings);

  await transporter.sendMail({
    from: `"Smart Job Tracker" <${settings.emailUser}>`,
    to: settings.emailTo,
    subject: `${jobs.length} New Job Alert${jobs.length > 1 ? 's' : ''} Found!`,
    html: buildEmailHtml(jobs),
  });

  console.log(`[Email] Alert sent to ${settings.emailTo} for ${jobs.length} jobs`);
}
