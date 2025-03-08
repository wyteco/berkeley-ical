import { z } from 'zod';
import { addDays, parse } from 'date-fns';

// ----------------------------------------------------------------------

/**
 * Parse a time-only string (e.g. `02:00 pm`) as a local JS Date pinned to 1970-01-01.
 */
export function parseTimeString(timeString: string): Date {
  const parsed = parse(timeString.trim(), 'hh:mm aa', new Date(0));

  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid time string: "${timeString}"`);
  }

  return parsed;
}

// ----------------------------------------------------------------------

/**
 * Parse a date-only string (e.g. `Jan 21, 2025`) as a local JS date.
 */
export function parseDateString(dateString: string): Date {
  const parsed = parse(dateString.trim(), 'MMM d, yyyy', new Date());

  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date string: "${dateString}"`);
  }

  return parsed;
}

// ----------------------------------------------------------------------

/**
 * Combine a date and a time JS Date into a single JS Date.
 *
 * @example
 * dateOnly => 2025-01-21T00:00 local
 * timeOnly => 1970-01-01T14:00 local
 * We want 2025-01-21T14:00 local
 */
export function combineDateAndTime(dateOnly: Date, timeOnly: Date): Date {
  /**
   * Extract the year, month, and day from dateOnly.
   */
  const year = dateOnly.getFullYear();
  const month = dateOnly.getMonth();
  const day = dateOnly.getDate();

  /**
   * Extract the hours and minutes from timeOnly.
   */
  const hours = timeOnly.getHours();
  const minutes = timeOnly.getMinutes();

  return new Date(year, month, day, hours, minutes);
}

// ----------------------------------------------------------------------

/**
 * We store the weekdays in a constant array to avoid
 * typos and to make it easier to update the code
 * if the website changes.
 * Note that `Date.getDay` assumes Sunday is 0, Monday is 1, etc.
 */
export const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export type Weekday = (typeof weekdays)[number];

export const weekdayLookup: Record<Weekday, string[]> = {
  MO: ['mo', 'mon', 'monday'],
  TU: ['tu', 'tue', 'tuesday'],
  WE: ['we', 'wed', 'wednesday'],
  TH: ['th', 'thu', 'thursday'],
  FR: ['fr', 'fri', 'friday'],
  SA: ['sa', 'sat', 'saturday'],
  SU: ['su', 'sun', 'sunday'],
};

// ----------------------------------------------------------------------

/**
 * Given a date (e.g. Jan 21, 2025) and a list of valid ICS day codes
 * (e.g. ["TU","TH"]), find the earliest date that matches one of the days.
 * For example, if the date is Jan 21, 2025 (a Tuesday) and the days are
 * ["TU","TH"], the function will return Jan 21, 2025.
 */
export function findFirstMeeting(
  startDate: Date,
  meetingDays: Weekday[]
): Date {
  // Turn the meetingDays into a set of numeric weekdays:
  const meetingDayIndexes = meetingDays.map((day) => weekdays.indexOf(day));

  // We'll loop from 'start' forward until we find a weekday that matches:
  let current = new Date(startDate);

  while (true) {
    const dayOfWeek = current.getDay();

    if (meetingDayIndexes.includes(dayOfWeek)) {
      return current;
    }

    current = addDays(current, 1);
  }
}

// ----------------------------------------------------------------------

/**
 * Define the schema for the course data.
 * This schema is used to validate the extracted data from the website.
 */
export const CourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  instructors: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date().nullable(),
  meetingDays: z.array(z.enum(weekdays)),
  meetingStartTime: z.date(),
  meetingEndTime: z.date().nullable(),
  location: z.string(),
  numberOfEnrollments: z.number(),
  capacity: z.number(),
});

export type CourseData = z.infer<typeof CourseSchema>;
