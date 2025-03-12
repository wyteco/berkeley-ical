import axios from 'axios';
import * as cheerio from 'cheerio';
//
import { CourseData, CourseSchema } from './helpers';
import { propertyLookup } from './properties';

// ----------------------------------------------------------------------

/**
 * This function fetches the HTML content of a given URL and parses it to extract
 * the course data. Note that there might be vulnerabilities if the website is rendered
 * using JavaScript, as this code only parses the static HTML content.
 */
export const fetchAndParseCourseData = async (
  url: string
): Promise<CourseData> => {
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
