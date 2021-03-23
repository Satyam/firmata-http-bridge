import Board from 'firmata';
import { FSA, ErrorCodes } from '../types.js';
import {
  digitalRead,
  digitalWrite,
  pinMode,
  Commands,
} from '../pinCommands.js';
import { app, board } from '../serverSetup.js';

const commands: Record<string, Commands> = {
  digitalRead,
  digitalWrite,
  pinMode,
};

export default function setup(): void {
  app.post('/command', async function (req, res) {
    const action = req.body as FSA;

    const { type } = action;

    if (type in commands) {
      res.json(await commands[type](board as Board, action));
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
