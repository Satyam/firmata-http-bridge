/**
 * Setup to accept commands via sockets, dispatch them,
 * and send back their replies
 * @module
 */

import { Server, Socket } from 'socket.io';

import { http } from '../config.js';
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

const commands: Record<string, Commands> = {
  digitalRead,
  digitalWrite,
  pinMode,
};

const cbCommands: Record<string, CallbackCommand> = {
  digitalReadSubscribe,
  digitalReadUnsubscribe,
};
/**
 * Sets up a new socket server to accept the following FSA actions via sockets
 * on the `command` `eventName` and dispatches them.
 *
 * * `digitalReadFSA`
 * * `digitalReadSubscribeFSA`
 * * `digitalReadUnsubscribeFSA`
 * * `digitalWriteFSA`
 * * `pinModeFSA`
 *
 * All replies will be *emitted* as JSON-encoded objects,
 * via sockets with `reply` as the `eventName`.
 *
 * Once initialized it emits a message with `hello` as the `eventName` and `world` as the message
 * for testing purposes, which can be safely ignored.
 */
export default function setup(): void {
  const io = new Server(http);

  io.on('connection', (socket: Socket) => {
    function reply(reply: FSA) {
      socket.emit('reply', JSON.stringify(reply));
    }

    /*
    It has to keep track of the callbacks used for each pin to listen to since the 
    [`removeListener`](https://nodejs.org/docs/latest/api/events.html#events_emitter_removelistener_eventname_listener)
    method needs to know which listener is to unsubscribe from.  It also prevents to subscribe twice with
    the same callback, which is pointless in this context.
    */
    const callbacks: Array<(value: number) => void> = [];
    const callback = (pin: number) => (value: number) => {
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
    };

    socket.on('command', async (msg) => {
      const action = JSON.parse(msg) as FSA;

      const {
        type,
        payload: { pin },
      } = action;

      if (type in commands) {
        reply(await commands[type](action));
      } else if (type in cbCommands) {
        if (!callbacks[pin]) callbacks[pin] = callback(pin);
        reply(cbCommands[type](action, callbacks[pin]));
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
