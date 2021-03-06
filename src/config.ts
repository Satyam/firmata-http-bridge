/**
 * Exports an object containing various configuration variables.
 * It will read the configuration options from the following sources with
 * the earlier overriding the later.
 * * Command line:  such as --HTTP_PORT=3000
 * * Environment variable of the same name
 * * defaults
 *    * HTTP_PORT= 8000
 *    * USB_PATH="/dev/ttyACM0"
 *    * TEST_DIGITAL_OUTPUT_PIN=13
 *    * TEST_DIGITAL_INPUT_PIN=2
 *
 * It may add some extra properties from the command line.
 * @module
 */
import { Command } from 'commander';
import { config as envRead } from 'dotenv';

import express from 'express';
import { createServer } from 'http';
// https://github.com/firmata/firmata.js/tree/master/packages/firmata.js
import Board from './my-firmata.js';

envRead();

// patch to prevent commander to parse options passed to jest
const argv = process.argv.filter(
  (part) =>
    !['--coverage', '--silent', '-u', '--verbose', '--runInBand'].includes(part)
);

const commander = new Command();

commander
  .description('Web server bridging commands to a microcontroller via Firmata')
  .option(
    '-hp, --HTTP_PORT <port>',
    'Port number for web-server',
    (value) => parseInt(value, 10),
    parseInt(process.env.HTTP_PORT, 10) || 8000
  )
  .option(
    '-up, --USB_PATH <device>',
    'Communication port the controller is connected to',
    process.env.USB_PATH || '/dev/ttyACM0'
  )
  .option(
    '-tdout, --TEST_DIGITAL_OUTPUT_PIN <pin number>',
    'Pin to use to perform digital output tests',
    (value) => parseInt(value, 10),
    parseInt(process.env.TEST_DIGITAL_OUTPUT_PIN, 10) || 13
  )
  .option(
    '-tdin, --TEST_DIGITAL_INPUT_PIN <pin number>',
    'Pin to use for digital input tests',
    (value) => parseInt(value, 10),
    parseInt(process.env.TEST_DIGITAL_INPUT_PIN, 10) || 2
  )
  .name(
    `
  node . [options]
or: 
  npm start -- [options]`
  )
  .addHelpText(
    'after',
    `
Example:

  with node:', 'node . --HTTP_PORT 3000
  with npm start:', 'npm start -- --HTTP_PORT 3000`
  )
  .parse(argv);

/**
 * Object containing the option settings from
 * either the command line, the environment variables of the same name
 * or defaults as described above.
 *
 * The `config` object is both the default export and a named
 * export called `config`
 */
export const config = commander.opts() as {
  HTTP_PORT: number;
  USB_PATH: string;
  TEST_DIGITAL_OUTPUT_PIN: number;
  TEST_DIGITAL_INPUT_PIN: number;
};

/**
 * Contains the instance of the Express server software
 */
export const app = express();
/**
 * Instace of the barebones http server
 */
export const http = createServer(app);
/**
 * Instace of Firmata Board class
 */
export const board = new Board(config.USB_PATH);

export default config;
