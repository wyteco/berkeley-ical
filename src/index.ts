import fs from 'fs';
import { Command } from 'commander';
import figlet from 'figlet';
import { z } from 'zod';

// ----------------------------------------------------------------------

const program = new Command();

console.log(figlet.textSync('Berkeley iCal'));

program
  .version('1.0.0')
  .description(
    'A command line tool to easily export your classes from the Berkeley Academic Guide to your calendar in iCal (.ics) format. Without having a student account lol!'
  )
  .option(
    '-o, --output <path>',
    'Specify output path for the .ics file (default: current directory)',
    './'
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
console.log('options', programOptions);

/**
 * This stores all the unvalidated URLs provided by the user.
 */
const programArguments = program.args;
console.log('arguments', programArguments);

// ----------------------------------------------------------------------
/**
 * Validate the output path provided by the user.
 * Note that the default output path is the current directory `./`.
 */
if (!fs.existsSync(programOptions.output)) {
  console.log(
    `Output path does not exist. Creating directory: ${programOptions.output}`
  );
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
/**
 * TODO: Fetch and parse the course data from the provided URLs.
 */

// ----------------------------------------------------------------------
/**
 * TODO: Generate the iCal (.ics) file from the parsed course data.
 */

// ----------------------------------------------------------------------
/**
 * TODO: Write the iCal (.ics) file to the output path.
 */
