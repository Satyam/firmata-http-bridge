/**
 *  Default entry point for the application from the command line.
 *
 *  @module
 */
import { start } from './server.js';

start().catch((err) => {
  console.error(err);
});
