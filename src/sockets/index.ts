import { Server, Socket } from 'socket.io';
import Board from 'firmata';

import { app, http, board } from '../serverSetup.js';
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

export default function setup(): void {
  const io = new Server(http);

  io.on('connection', (socket: Socket) => {
    console.log(socket.id);
    app.set('socket', socket);

    function reply(reply: FSA) {
      socket.emit('reply', JSON.stringify(reply));
    }

    socket.on('command', async (msg) => {
      const action = JSON.parse(msg) as FSA;

      const { type } = action;

      if (type in commands) {
        reply(await commands[type](board as Board, action));
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

    socket.on('disconnect', (reason) => {
      console.log(`Socket ${socket.id} disconnected`, reason);
    });
    // ...
  });
}
