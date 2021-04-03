/**
 * Exports an object containing various configuration variables.
 * It will read the configuration options from the following sources with
 * the earlier overriding the later.
 * * Command line:  such as --HTTP_PORT=3000
 * * Environment variable of the same name
 * * defaults
 *    * HTTP_PORT= 8000
 *    * USB_PATH="/dev/ttyACM0"
 *
 * It may add some extra properties from the command line.
 * @module
 */
import { Command } from 'commander';
import { config as envRead } from 'dotenv';

import express from 'express';
import { createServer } from 'http';
// https://github.com/firmata/firmata.js/tree/master/packages/firmata.js
import Board from 'firmata';

envRead();

// patch to prevent commander to parse options passed to jest
const argv = process.argv.filter(
  (part) =>
    !['-w=1', '--coverage', '--silent', '-u', '--verbose'].includes(part)
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

export const config = commander.opts();

export const app = express();
export const http = createServer(app);
export const board = new Board(config.USB_PATH);

export default config;
