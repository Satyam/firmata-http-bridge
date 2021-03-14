import { validDigitalPin, validMode, validOutput } from './utils';
import { Commands, ErrorCodes } from './types';
import type { digitalWriteFSA, pinModeFSA } from './actionBuilders';
import { makeReply } from './actionBuilders';

export const pinMode: Commands<pinModeFSA> = (board, action) => {
  const {
    payload: { pin, mode },
  } = action;

  if (!validDigitalPin(board, pin)) {
    return makeReply(action, {
      error: {
        code: ErrorCodes.BAD_PIN,
        msg: 'Invalid pin',
      },
    });
  }

  if (!validMode(board, pin, mode)) {
    return makeReply(action, {
      error: {
        code: ErrorCodes.BAD_MODE,
        msg: 'Invalid mode for pin',
      },
    });
  }

  board.pinMode(pin, mode);
  return makeReply(action);
};

export const digitalWrite: Commands<digitalWriteFSA> = (board, action) => {
  const {
    payload: { pin, output },
  } = action;

  if (!validDigitalPin(board, pin)) {
    return makeReply(action, {
      error: {
        code: ErrorCodes.BAD_PIN,
        msg: 'Invalid pin',
      },
    });
  }

  if (!validOutput(board, pin, output)) {
    return makeReply(action, {
      error: {
        code: ErrorCodes.BAD_OUTPUT,
        msg: 'Invalid output for pin',
      },
    });
  }

  board.digitalWrite(pin, output);
  return makeReply(action);
};
