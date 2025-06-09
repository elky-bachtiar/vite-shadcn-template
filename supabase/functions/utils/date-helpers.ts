/**
 * Helper functions for generating realistic dates for campaigns
 */

/**
 * Get a random date within the past N months
 * 
 * @param months Number of months in the past to span
 * @returns Date object
 */
export function getRandomPastDate(months: number = 6): Date {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setMonth(now.getMonth() - Math.floor(Math.random() * months));
  pastDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day (1-28)
  return pastDate;
}

/**
 * Get a future date that's between minDays and maxDays from the startDate
 * 
 * @param startDate Reference start date
 * @param minDays Minimum days in the future
 * @param maxDays Maximum days in the future
 * @returns Date object
 */
export function getRandomFutureDate(startDate: Date, minDays: number = 30, maxDays: number = 90): Date {
  const endDate = new Date(startDate);
  const daysToAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  endDate.setDate(startDate.getDate() + daysToAdd);
  return endDate;
}

/**
 * Convert a Date object to an ISO string with timezone info, suitable for database insertion
 * 
 * @param date Date object
 * @returns ISO string with timezone
 */
export function toISOWithTimezone(date: Date): string {
  return date.toISOString();
}

/**
 * Generate random timestamps for a campaign
 * 
 * @returns Object with start_date, end_date, created_at, and updated_at dates
 */
export function generateCampaignDates() {
  const createdAt = getRandomPastDate(6);
  const startDate = new Date(createdAt);
  
  // Some campaigns might not have an end date
  const hasEndDate = Math.random() > 0.2;
  
  return {
    start_date: toISOWithTimezone(startDate),
    end_date: hasEndDate ? toISOWithTimezone(getRandomFutureDate(startDate)) : null,
    created_at: toISOWithTimezone(createdAt),
    updated_at: toISOWithTimezone(createdAt) // Same as created_at initially
  };
}
