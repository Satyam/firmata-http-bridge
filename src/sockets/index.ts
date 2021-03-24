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
  CallbackCommand,
} from '../pinCommands.js';
import { makeReply, digitalReadActionBuilder } from '../actionBuilders.js';

const commands: Record<string, Commands> = {
  digitalRead,
  digitalReadUnsubscribe,
  digitalWrite,
  pinMode,
};

const cbCommands: Record<string, CallbackCommand> = {
  digitalReadSubscribe,
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
 * All replies will be *emitted* as JSON-encoded objects,
 * via sockets with the `reply` as the `eventName`
 *
 * Once initialized it emits a message with `hello` as the `eventName` and `world` as the message,
 * which can be safely ignored.
 */
export default function setup(): void {
  const io = new Server(http);

  io.on('connection', (socket: Socket) => {
    function reply(reply: FSA) {
      socket.emit('reply', JSON.stringify(reply));
    }

    socket.on('command', async (msg) => {
      const action = JSON.parse(msg) as FSA;

      const {
        type,
        payload: { pin },
      } = action;

      if (type in commands) {
        reply(await commands[type](action));
      } else if (type in cbCommands) {
        reply(
          cbCommands[type](action, (value) => {
            socket.emit(
              'reply',
              JSON.stringify({
                type: 'digitalRead_reply',
                payload: { pin, value },
                meta: {
                  date: new Date().toISOString(),
                },
              })
            );
          })
        );
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
