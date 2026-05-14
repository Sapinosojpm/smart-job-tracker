/**
 * Scam Detection Logic for Job Listings
 * Checks for common red flags in job titles and descriptions.
 */

const SCAM_KEYWORDS = [
  'easy money',
  'earn from home',
  'no experience needed',
  'high pay',
  'whatsapp',
  'telegram',
  'contact us on',
  'dm for details',
  'investment',
  'crypto',
  'bitcoin',
  'quick cash',
  'passive income',
  'part time job for students',
  'package handler',
  'reshipping',
];

export interface ScamResult {
  isScam: boolean;
  score: number;
  reasons: string[];
}

export function detectScam(title: string, description: string): ScamResult {
  const reasons: string[] = [];
  let score = 0;

  const content = `${title} ${description}`.toLowerCase();

  SCAM_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      score += 0.25;
      reasons.push(`Contains suspicious keyword: "${keyword}"`);
    }
  });

  // Check for excessive capitalization
  const upperCaseCount = (content.match(/[A-Z]/g) || []).length;
  if (upperCaseCount > content.length * 0.3 && content.length > 50) {
    score += 0.2;
    reasons.push('Excessive capitalization detected');
  }

  // Check for contact info patterns (phone/links) without proper context
  const contactPattern = /\b(\+?\d{10,12}|09\d{9})\b/g;
  if (contactPattern.test(content)) {
    score += 0.3;
    reasons.push('Direct phone number in description');
  }

  const isScam = score >= 0.5;

  return {
    isScam,
    score: Math.min(score, 1),
    reasons,
  };
}
