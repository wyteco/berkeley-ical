import { add, format } from 'date-fns';
//
import { combineDateAndTime, CourseData, findFirstMeeting } from './helpers';

// ----------------------------------------------------------------------

/**
 * ICS wants "yyyyMMdd'T'HHmmss".
 * We'll assume dt is local time, and we do not append 'Z'.
 */
function formatIcsDateTimeLocal(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

// ----------------------------------------------------------------------

export const generateIcsEvent = (courseData: CourseData): string => {
  const { startDate, endDate, meetingDays, meetingStartTime, meetingEndTime } =
    courseData;

  /**
   * In ICS, you typically want your DTSTART to be the first actual day the event occurs.
   * As the startDate might be before an actual meeting day,
   * we need to find the first meeting day.
   */
  const firstMeetingDay = findFirstMeeting(startDate, meetingDays);

  /**
   * Construct the first meeting with the actual start and end time.
   * If the end time is not provided, we'll assume it's 30 minutes after the start time.
   */
  const firstMeetingStartDate = combineDateAndTime(
    firstMeetingDay,
    meetingStartTime
  );
  const firstMeetingEndDate = combineDateAndTime(
    firstMeetingDay,
    meetingEndTime ?? add(meetingStartTime, { hours: 0.5 })
  );

  const dtStartString = formatIcsDateTimeLocal(firstMeetingStartDate);
  const dtEndString = formatIcsDateTimeLocal(firstMeetingEndDate);

  /**
   * All the dates and times from the course data are in local time.
   * As Berkeley is in the America/Los_Angeles timezone,
   * we can set the timezone ID to America/Los_Angeles.
   */
  const tzid = 'America/Los_Angeles';

  const icsLines = [];
  icsLines.push(`BEGIN:VEVENT`);
  icsLines.push(`DTSTART;TZID=${tzid}:${dtStartString}`);
  icsLines.push(`DTEND;TZID=${tzid}:${dtEndString}`);

  /**
   * If there is an end date, we need to add an RRULE to the event.
   * This will make the event repeat every week on the specified days.
   */
  if (endDate) {
    /**
     * We'll do a simple approach: last day = endDate
     */
    const untilString = format(endDate, "yyyyMMdd'T'HHmmss'Z'");

    /**
     * TODO: Make sure that the last event is saved correctly. I have not tested this.
     * Maybe this should be adjusted to a timezone or the end of the day.
     */
    icsLines.push(
      `RRULE:FREQ=WEEKLY;BYDAY=${meetingDays.join(',')};UNTIL=${untilString}`
    );
  }

  icsLines.push(`SUMMARY:${courseData.title}`);
  icsLines.push(`LOCATION:${courseData.location}`);
  icsLines.push(
    `DESCRIPTION:${`Instructors: ${courseData.instructors.join(
      ', '
    )}\\nCapacity: ${courseData.capacity}\\nEnrollments: ${
      courseData.numberOfEnrollments
    }\\n\\n${courseData.description}`}`
  );
  icsLines.push(`END:VEVENT`);

  return icsLines.join('\r\n');
};
