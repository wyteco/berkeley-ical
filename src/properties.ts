//
import {
  CourseData,
  parseDateString,
  parseTimeString,
  Weekday,
  weekdayLookup,
} from './helpers';

// ----------------------------------------------------------------------

/**
 * This code might need to be updated if the website changes.
 * The selectors are used to extract the course data from the HTML content.
 * Note that each `transform` function returns the type of the corresponding
 * property in the `CourseData` type.
 *
 * This code expects the data to be from the Berkeley Academic Guide
 * course pages like `https://classes.berkeley.edu/content/2025-spring-compsci-c280-001-lec-001`.
 */
export const propertyLookup: {
  [Property in keyof CourseData]: {
    query: string;
    transform: (textValue: string) => CourseData[Property];
  };
} = {
  title: {
    query: 'h2.sf--course-title',
    transform: (textValue) => textValue.trim(),
  },
  description: {
    query: 'section#section-course-description div.section-content',
    transform: (textValue) => textValue.trim(),
  },
  instructors: {
    query: 'div.sf--details div.sf--instructors p',
    transform: (textValue) => {
      return textValue.split(',').map((instructor) => instructor.trim());
    },
  },
  startDate: {
    query: 'div.sf--details div.sf--meeting-dates',
    transform: (textValue) => {
      const startDateText = textValue.split('-').at(0)?.trim();

      if (!startDateText) {
        console.warn(
          `Invalid date range string: "${textValue}". No start date found. Trying to parse as a single date.`
        );

        return parseDateString(textValue);
      }

      return parseDateString(startDateText);
    },
  },
  endDate: {
    query: 'div.sf--details div.sf--meeting-dates',
    transform: (textValue) => {
      const endDateText = textValue.split('-').at(1)?.trim();

      if (!endDateText) {
        console.warn(
          `Invalid date range string: "${textValue}". No end date found. Using null as end date.`
        );

        return null;
      }

      return parseDateString(endDateText);
    },
  },
  meetingDays: {
    query: 'div.sf--details div.sf--meeting-days',
    transform: (textValue) => {
      return textValue.split(',').map((day) => {
        const weekday = Object.entries(weekdayLookup)
          .find(([weekday, values]) =>
            values.includes(day.toLowerCase().trim())
          )
          ?.at(0) as Weekday;

        if (!weekday) {
          throw new Error(`Invalid weekday: "${day.trim()}"`);
        }

        return weekday;
      });
    },
  },
  meetingStartTime: {
    query: 'div.sf--details div.sf--meeting-time',
    transform: (textValue) => {
      const startTime = textValue.split('-').at(0)?.trim();

      if (!startTime) {
        throw new Error(`Invalid time range string: "${textValue}"`);
      }

      return parseTimeString(startTime);
    },
  },
  meetingEndTime: {
    query: 'div.sf--details div.sf--meeting-time',
    transform: (textValue) => {
      const endTime = textValue.split('-').at(1)?.trim();

      if (!endTime) {
        console.warn(
          `Invalid time range string: "${textValue}". No end time found. Using null as end time.`
        );

        return null;
      }

      return parseTimeString(endTime);
    },
  },
  location: {
    query: 'div.sf--details div.sf--location',
    transform: (textValue) => textValue.trim(),
  },
  numberOfEnrollments: {
    query: 'section.current-enrollment .stats div:contains("Enrolled:")',
    transform: (textValue) => {
      const numberOfEnrollments = textValue.match(/\d+/)?.[0];

      if (!numberOfEnrollments) {
        throw new Error(`Invalid number of enrollments string: "${textValue}"`);
      }

      return parseInt(numberOfEnrollments, 10);
    },
  },
  capacity: {
    query: 'section.current-enrollment .stats div:contains("Capacity:")',
    transform: (textValue) => {
      const capacity = textValue.match(/\d+/)?.[0];

      if (!capacity) {
        throw new Error(`Invalid capacity string: "${textValue}"`);
      }

      return parseInt(capacity, 10);
    },
  },
};
