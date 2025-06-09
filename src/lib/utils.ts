import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 * @param inputs Array of class values to be combined
 * @returns Combined and merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number value as currency
 * @param amount The numeric amount to format
 * @param locale The locale to use for formatting (default: 'nl-NL')
 * @param currency The currency code to use (default: 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, locale = 'nl-NL', currency = 'EUR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @param options Optional Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Calculate percentage for progress bars
 * @param raised The amount raised so far
 * @param goal The target amount to reach
 * @returns A percentage value between 0 and 100
 */
export function calculateProgress(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

/**
 * Generate URL-friendly slug from a title string
 * @param title The original title text to convert
 * @returns A URL-friendly slug string with hyphens instead of spaces and special characters
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}