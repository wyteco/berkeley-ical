#! /usr/bin/env node

import fs from 'fs';
import { Command } from 'commander';
import figlet from 'figlet';
import { z } from 'zod';
//
import { generateIcsEvent } from './ics';
import { fetchAndParseCourseData } from './parse';

// ----------------------------------------------------------------------

const program = new Command();

console.log(figlet.textSync('Berkeley iCal'));
console.log('');

program
  .version('1.0.0')
  .description(
    'A command line tool to easily export your classes from the Berkeley Academic Guide to your calendar in iCal (.ics) format. Without having a student account lol!'
  )
  .option('-v, --verbose', 'Enable verbose mode')
  .option(
    '-o, --output <path>',
    'Specify output path for the .ics file (default: current directory)',
    '.'
  )
  .arguments('<urls...>')
  .action((urls) => {
    return urls;
  })
  .parse(process.argv);

/**
 * This stores all the unvalidated options provided by the user.
 */
const programOptions = program.opts();

const isVerbose = !!programOptions.verbose;
if (isVerbose) {
  console.log('Verbose mode enabled.');
  console.log('');
}

if (isVerbose) {
  console.log('options', programOptions);
  console.log('');
}

/**
 * This stores all the unvalidated URLs provided by the user.
 */
const programArguments = program.args;

if (isVerbose) {
  console.log('arguments', programArguments);
  console.log('');
}

// ----------------------------------------------------------------------
/**
 * Validate the output path provided by the user.
 * Note that the default output path is the current directory `.`.
 */
if (!fs.existsSync(programOptions.output)) {
  console.log(
    `Output path does not exist. Creating directory: ${programOptions.output}.`
  );
  console.log('');
  fs.mkdirSync(programOptions.output, { recursive: true });
}

if (!fs.statSync(programOptions.output).isDirectory()) {
  console.error('The output path is not a valid directory!');
  process.exit(1);
}

const validatedOutputPath = programOptions.output;

// ----------------------------------------------------------------------
/**
 * Validate the URLs provided by the user.
 * Every URL should be a valid URL, we do not just filter out the
 * invalid ones.
 */
if (programArguments.length === 0) {
  console.error('No URLs provided.');
  process.exit(1);
}

const validatedUrls = programArguments.map((argument) => {
  try {
    return z.string().url().parse(argument);
  } catch (error) {
    console.error('Invalid URL provided:', argument);
    process.exit(1);
  }
});

// ----------------------------------------------------------------------

const run = async () => {
  console.log('Fetching and parsing course data...');
  console.log(
    'This may take a while depending on the number of URLs provided.'
  );

  /**
   * Fetch and parse the course data from the provided URLs.
   */
  const courses = await Promise.all(
    validatedUrls.map((url) => fetchAndParseCourseData(url))
  );

  console.log('Fetched and parsed course data of all the URLs.');
  console.log(
    `There is ${courses.length} course${courses.length === 1 ? '' : 's'}.`
  );
  console.log('');

  if (isVerbose) {
    console.log('courses', courses);
    console.log('');
  }

  // ----------------------------------------------------------------------
  /**
   * TODO: Generate the iCal (.ics) file from the parsed course data.
   */
  const icsEventStrings = courses.map((course) => {
    if (!course) {
      console.error('Some courses could not be parsed.');
      process.exit(1);
    }

    return generateIcsEvent(course);
  });

  const icsFileString = `BEGIN:VCALENDAR\nVERSION:2.0\n${icsEventStrings.join(
    '\n'
  )}\nEND:VCALENDAR`;

  // ----------------------------------------------------------------------
  /**
   * TODO: Write the iCal (.ics) file to the output path.
   */
  const icsFilePath = `${validatedOutputPath}/berkeley-classes.ics`;

  fs.writeFileSync(icsFilePath, icsFileString);

  console.log(`iCal file generated at ${icsFilePath}.`);
  console.log('Done!');

  process.exit(0);
};

run();
