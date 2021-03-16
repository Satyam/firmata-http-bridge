import yargs from 'yargs';
import { config as envRead } from 'dotenv';
envRead();

const config = yargs(process.argv.slice(2))
  .usage('Usage: node . [options]\n or: npm start -- [options] ')
  .example('with node:', 'node . --HTTP_PORT=3000')
  .example('with npm start:', 'npm start -- --HTTP_PORT=3000')
  .option({
    HTTP_PORT: {
      type: 'number',
      alias: 'hp',
      default: parseInt(process.env.HTTP_PORT, 10) || 8000,
    },
  })
  .option({
    USB_PORT: {
      type: 'string',
      alias: 'up',
      default: process.env.USB_PORT || '/dev/ttyACM0',
    },
  }).argv;

export default config;
