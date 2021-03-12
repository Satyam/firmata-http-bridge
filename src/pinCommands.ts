import Board from 'firmata';
import { validDigitalPin, validMode, validOutput } from './utils';
import { FSA, Commands, ErrorCodes } from './types';

export type pinModeFSA = FSA<'pinMode', { pin: number; mode: Board.PIN_MODE }>;

export const pinMode: Commands<pinModeFSA> = (board, action) => {
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

export type digitalWriteFSA = FSA<
  'digitalWrite',
  { pin: number; output: Board.PIN_STATE }
>;

export const digitalWrite: Commands<digitalWriteFSA> = (board, action) => {
  const {
    payload: { pin, output },
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

  if (!validOutput(board, pin, output)) {
    return {
      ...action,
      error: {
        code: ErrorCodes.BAD_OUTPUT,
        msg: 'Invalid output for pin',
      },
    };
  }

  board.digitalWrite(pin, output);
  return action;
};
