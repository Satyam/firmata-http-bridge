/**
 * Exports an object containing various configuration variables.
 * It will read the configuration options from the following sources with
 * the earlier overriding the later.
 * * Command line:  such as --HTTP_PORT=3000
 * * Environment variable of the same name
 * * defaults
 *    * HTTP_PORT= 8000
 *    * USB_PORT="/dev/ttyACM0"
 *
 * It may add some extra properties from the command line.
 * @module
 */
import yargs from 'yargs';
import { config as envRead } from 'dotenv';

envRead();

const config = yargs(process.argv.slice(2))
  .usage('Usage: node . [options]\n or: npm start -- [options] ')
  .example('with node:', 'node . --HTTP_PORT=3000')
  .example('with npm start:', 'npm start -- --HTTP_PORT=3000')
  .options({
    HTTP_PORT: {
      type: 'number',
      alias: 'hp',
      default: parseInt(process.env.HTTP_PORT, 10) || 8000,
    },
    USB_PORT: {
      type: 'string',
      alias: 'up',
      default: process.env.USB_PORT || '/dev/ttyACM0',
    },
  }).argv;

export default config;
