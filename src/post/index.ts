/**
 * Setup to accept FSA commands via HTTP POST,
 * dispatches them,
 * and send back their replies
 * @module
 */

import { FSA, ErrorCodes } from '../types.js';
import {
  digitalRead,
  digitalWrite,
  pinMode,
  Commands,
} from '../pinCommands.js';

import { app } from '../serverSetup.js';

const commands: Record<string, Commands> = {
  digitalRead,
  digitalWrite,
  pinMode,
};

/**
 * Sets the express server to respond to HTTP POST commands,
 * containing the following FSA actions,
 * executes them and replies in a JSON-encoded FSA message.
 *
 * * `digitalReadFSA`
 * * `digitalWriteFSA`
 * * `pinModeFSA`
 *
 * @export
 */
export default function setup(): void {
  app.post('/command', async function (req, res) {
    const action = req.body as FSA;

    const { type } = action;

    if (type in commands) {
      res.json(await commands[type](action));
    } else {
      res.json({
        ...action,
        error: {
          code: ErrorCodes.BAD_ACTION_TYPE,
          msg: 'Invalid command',
        },
      });
    }
  });
}
