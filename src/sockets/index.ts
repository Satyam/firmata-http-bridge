/**
 * Setup to accept commands via sockets, dispatch them,
 * and send back their replies
 * @module
 */

import { Server, Socket } from 'socket.io';

import { app, http } from '../serverSetup.js';
import { FSA, ErrorCodes } from '../types.js';
import {
  digitalRead,
  digitalReadSubscribe,
  digitalReadUnsubscribe,
  digitalWrite,
  pinMode,
  Commands,
} from '../pinCommands.js';

const commands: Record<string, Commands> = {
  digitalRead,
  digitalReadSubscribe,
  digitalReadUnsubscribe,
  digitalWrite,
  pinMode,
};
/**
 * Sets up a new socket server to accept the following FSA actions via sockets and
 * dispatches them.
 *
 * * `digitalReadFSA`
 * * `digitalReadSubscribeFSA`
 * * `digitalReadUnsubscribeFSA`
 * * `digitalWriteFSA`
 * * `pinModeFSA`
 *
 * Sets the `socket` in the `app` express server so that it can be
 * read via `app.get('socket') as Socket`.
 *
 * All replies will be *emitted* as JSON-encoded objects,
 * via sockets with the `reply` as the `eventName`
 *
 * Once initialized it emits a message with `hello` as the `eventName` and `world` as the message,
 * which can be safely ignored.
 */
export default function setup(): void {
  const io = new Server(http);

  io.on('connection', (socket: Socket) => {
    app.set('socket', socket);

    function reply(reply: FSA) {
      socket.emit('reply', JSON.stringify(reply));
    }

    socket.on('command', async (msg) => {
      const action = JSON.parse(msg) as FSA;

      const { type } = action;

      if (type in commands) {
        reply(await commands[type](action));
      } else {
        reply({
          ...action,
          error: {
            code: ErrorCodes.BAD_ACTION_TYPE,
            msg: 'Invalid command',
          },
        });
      }
    });
    socket.emit('hello', 'world');
  });
}
