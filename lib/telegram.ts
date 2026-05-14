import { getAppSettings } from './settings';

interface JobAlert {
  title: string;
  company: string;
  link: string;
  source: string;
  location?: string;
}

export async function sendTelegramNotification(userId: string, jobs: JobAlert[]): Promise<void> {
  const settings = await getAppSettings(userId);
  const token = settings.telegramBotToken;
  const chatId = settings.telegramChatId;

  if (!token || !chatId) {
    console.log('[Telegram] Skipping — credentials not configured in settings');
    return;
  }

  const messages = jobs.map((job) =>
    [
      `*New Job Found!*`,
      ``,
      `📌 *${escapeMarkdown(job.title)}*`,
      `🏢 ${escapeMarkdown(job.company)}`,
      job.location ? `📍 ${escapeMarkdown(job.location)}` : null,
      `🌐 ${escapeMarkdown(job.source)}`,
      ``,
      `🔗 [View Job](${job.link})`,
    ]
      .filter(Boolean)
      .join('\n')
  );

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  for (const message of messages) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('[Telegram] API error:', err);
      }
    } catch (err) {
      console.error('[Telegram] Send error:', err);
    }
  }

  console.log(`[Telegram] Sent ${messages.length} notification(s) to chat ${chatId}`);
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
