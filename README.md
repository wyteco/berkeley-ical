# Berkeley iCal

A CLI tool to export Berkeley classes to your calendar. It parses course URLs from the [Berkeley Academic Guide](https://classes.berkeley.edu) and generates an .ics file for easy import into your calendar app.

## Installation

```bash
npm install -g @wyteco/berkeley-ical
```

## Usage

```bash
berkeley-ical <course-urls...> [options]
```

### Example

```bash
berkeley-ical https://classes.berkeley.edu/content/2025-spring-compsci-294-280-lec-280 https://classes.berkeley.edu/content/2025-spring-compsci-c280-001-lec-001
```

This will create a `berkeley-classes.ics` file in your current directory. Opening that file will create recurring events for all of the classes in your calendar.

### Options

- `-o, --output <path>`: Specify where to save the .ics file (default: current directory)

## How it works

1. Paste a course URL from the [Berkeley Academic Guide](https://classes.berkeley.edu)
2. The tool scrapes the course info (dates, days, times, location, number of enrollments, etc.)
3. Generates an .ics file you can import into any calendar app

## Notes

- Times are in Pacific Time (America/Los_Angeles)
- Recurring events are created for the date range provided on the course page

## Contributing

PRs welcome! Check out the [GitHub repo](https://github.com/wyteco/berkeley-ical).

Made with ❤️ by Oscar Stahlberg whilst visiting Berkeley in 2025 and staying at Ridge House. Thanks for the great time!
