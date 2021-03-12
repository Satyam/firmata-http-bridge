import Board from 'firmata';
import { validDigitalPin, validMode } from './utils';
import { Commands, ErrorCodes } from './types';

export const pinMode: Commands<
  'pinMode',
  { pin: number; mode: Board.PIN_MODE }
> = (board, action) => {
  const {
    payload: { pin, mode },
  } = action;

  if (!validDigitalPin(board, pin)) {
    return {
      ...action,
      error: {
        code: ErrorCodes.BAD_PIN,
        msg: 'Invalid pin',
      },
    };
  }

  if (!validMode(board, pin, mode)) {
    return {
      ...action,
      error: {
        code: ErrorCodes.BAD_MODE,
        msg: 'Invalid mode for pin',
      },
    };
  }

  board.pinMode(pin, mode);
  return action;
};
