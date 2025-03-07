import axios from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';

// ----------------------------------------------------------------------

const CourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  instructors: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date(),
  meetingDays: z.array(z.string()),
  meetingStartTime: z.string(),
  meetingEndTime: z.string(),
  location: z.string(),
});

type CourseData = z.infer<typeof CourseSchema>;

export const fetchAndParseCourseData = async (
  url: string
): Promise<CourseData | null> => {
  /**
   * Fetch the HTML content of the provided URL.
   */
  const { data } = await axios.get(url);

  /**
   * Parse the HTML content to extract the course data.
   * Note that this doesn't work if the website is rendered using JavaScript.
   */
  const $ = cheerio.load(data);

  /**
   * Parse all the course data from the HTML content.
   */
  const title = $('h2.sf--course-title').text();

  console.log(title);

  return null;
};
