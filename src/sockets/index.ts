import { Server, Socket } from 'socket.io';
import Board from 'firmata';

import { FSA, ErrorCodes, SetupType } from '../types.js';
import {
  digitalRead,
  digitalWrite,
  pinMode,
  Commands,
} from '../pinCommands.js';

const commands: Record<string, Commands> = {
  digitalRead,
  digitalWrite,
  pinMode,
};

export default function setup({ app, http, board }: SetupType): void {
  const io = new Server(http);

  io.on('connection', (socket: Socket) => {
    console.log(socket.id);

    function reply(reply: FSA) {
      socket.emit('reply', JSON.stringify(reply));
    }

    socket.on('command', async (anotherSocketId, msg) => {
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
