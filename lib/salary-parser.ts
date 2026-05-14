/**
 * Salary Parser
 * Converts various salary string formats into numeric min/max values.
 */

export interface SalaryData {
  min: number | null;
  max: number | null;
  currency: string;
}

export function parseSalary(salaryStr: string | null): SalaryData {
  const result: SalaryData = { min: null, max: null, currency: 'PHP' };
  
  if (!salaryStr) return result;

  const cleaned = salaryStr.replace(/,/g, '').toLowerCase();

  // Try to find numbers
  const numbers = cleaned.match(/\d+(\.\d+)?/g);
  if (!numbers) return result;

  const parsedNumbers = numbers.map(n => parseFloat(n));

  // Determine if it's hourly, monthly, or yearly
  let multiplier = 1;
  if (cleaned.includes('hour') || cleaned.includes('/hr')) {
    multiplier = 160; // Approx monthly hours
  } else if (cleaned.includes('year') || cleaned.includes('/yr')) {
    multiplier = 1 / 12;
  }

  if (parsedNumbers.length >= 2) {
    result.min = Math.min(...parsedNumbers) * multiplier;
    result.max = Math.max(...parsedNumbers) * multiplier;
  } else if (parsedNumbers.length === 1) {
    result.min = parsedNumbers[0] * multiplier;
    result.max = parsedNumbers[0] * multiplier;
  }

  // Detect currency
  if (cleaned.includes('$') || cleaned.includes('usd')) {
    result.currency = 'USD';
  } else if (cleaned.includes('₱') || cleaned.includes('php')) {
    result.currency = 'PHP';
  }

  return result;
}
