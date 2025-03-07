import axios from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';

// ----------------------------------------------------------------------

const CourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  instructors: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date().nullable(),
  meetingDays: z.array(z.string()),
  meetingStartTime: z.string(),
  meetingEndTime: z.string().nullable(),
  location: z.string(),
  numberOfEnrollments: z.number(),
  capacity: z.number(),
});

type CourseData = z.infer<typeof CourseSchema>;

/**
 * This code might need to be updated if the website changes.
 * The selectors are used to extract the course data from the HTML content.
 * Note that each `transform` function returns the type of the corresponding
 * property in the `CourseData` type.
 */
const propertyLookup: {
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
          `Invalid date range string: ${textValue}. No start date found. Trying to parse as a single date.`
        );
        const parsedDate = new Date(textValue.trim());

        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Invalid date string: ${textValue}`);
        }

        return parsedDate;
      }

      const startDate = new Date(startDateText);

      if (isNaN(startDate.getTime())) {
        throw new Error(`Invalid start date string: ${startDateText}`);
      }

      return startDate;
    },
  },
  endDate: {
    query: 'div.sf--details div.sf--meeting-dates',
    transform: (textValue) => {
      const endDateText = textValue.split('-').at(1)?.trim();

      if (!endDateText) {
        return null;
      }

      const endDate = new Date(endDateText);

      if (isNaN(endDate.getTime())) {
        throw new Error(`Invalid end date string: ${endDateText}`);
      }

      return endDate;
    },
  },
  meetingDays: {
    query: 'div.sf--details div.sf--meeting-days',
    transform: (textValue) => {
      return textValue
        .split(',')
        .map((day) => day.trim())
        .filter((day) => day.length > 0);
    },
  },
  meetingStartTime: {
    query: 'div.sf--details div.sf--meeting-time',
    transform: (textValue) => {
      const startTime = textValue.split('-').at(0)?.trim();

      if (!startTime) {
        console.warn(
          `Invalid time range string: ${textValue}. No start time found. Trying to parse as a single time.`
        );

        return textValue.trim();
      }

      return startTime;
    },
  },
  meetingEndTime: {
    query: 'div.sf--details div.sf--meeting-time',
    transform: (textValue) => {
      const endTime = textValue.split('-').at(1)?.trim();

      if (!endTime) {
        return null;
      }

      return endTime;
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
        throw new Error(`Invalid number of enrollments string: ${textValue}`);
      }

      return parseInt(numberOfEnrollments, 10);
    },
  },
  capacity: {
    query: 'section.current-enrollment .stats div:contains("Capacity:")',
    transform: (textValue) => {
      const capacity = textValue.match(/\d+/)?.[0];

      if (!capacity) {
        throw new Error(`Invalid capacity string: ${textValue}`);
      }

      return parseInt(capacity, 10);
    },
  },
};

// ----------------------------------------------------------------------

export const fetchAndParseCourseData = async (
  url: string
): Promise<CourseData | null> => {
  /**
   * Fetch the HTML content of the provided URL.
   */
  const { data: htmlData } = await axios.get(url);

  /**
   * Parse the HTML content to extract the course data.
   * Note that this doesn't work if the website is rendered using JavaScript.
   */
  const $ = cheerio.load(htmlData);

  /**
   * Parse all the course data from the HTML content.
   */
  const extractedData = Object.fromEntries(
    Object.entries(propertyLookup).map(([property, { query, transform }]) => {
      const element = $(query).first();
      const textValue = element.text().trim();

      const transformedValue = transform(textValue);

      return [property, transformedValue];
    })
  );

  /**
   * Validate the extracted data using the schema.
   */
  const parsedData = CourseSchema.parse(extractedData);

  return parsedData;
};
