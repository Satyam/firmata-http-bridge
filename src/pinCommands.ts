/**
 * Functions to send the FSA commands to the board
 * @module
 */
import { validDigitalPin, validMode, validOutput } from './utils.js';
import type Board from 'firmata';

import type {
  digitalWriteFSA,
  pinModeFSA,
  digitalReadFSA,
} from './actionBuilders.js';

import { FSA, ErrorCodes } from './types.js';
import { makeReply } from './actionBuilders.js';

/**
 * Describes the format of the commands dispatched from the web server.
 * @typeParam F the shape of the FSA used in this command
 * @typeParam Meta the shape of extra `meta` properties
 */
export type Commands<F extends FSA = FSA, Meta = any> = (
  board: Board,
  action: F
) => FSA | Promise<FSA>;

/**
 * Sends the `pinModeFSA` action type to the given board.
 * It is best to use [[pinModeActionBuilder]] to build the action
 *
 * This function returns immediately (not a Promise)
 * @exports
 * @param board - Board to send the command to
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
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

/**
 * Sends the `digitalWriteFSA` action type to the given board.
 * It is best to use [[digitalWriteActionBuilder]] to build the action
 *
 * This function returns immediately (not a Promise)
 * @exports
 * @param board - Board to send the command to
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
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

/**
 * Sends the `digitalReadFSA` action type to the given board.
 * It is best to use [[digitalReadActionBuilder]] to build the action
 *
 * This function returns a `Promise` resolved to a reply FSA.
 * If an error is detected if will immediately return an error FSA.
 * @exports
 * @param board - Board to send the command to
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const digitalRead: Commands<digitalReadFSA> = (board, action) => {
  const {
    payload: { pin },
  } = action;
  if (!validDigitalPin(board, pin)) {
    return makeReply(action, {
      error: {
        code: ErrorCodes.BAD_PIN,
        msg: 'Invalid pin',
      },
    });
  }
  return new Promise((resolve) => {
    board.digitalRead(pin, (value) => {
      board.reportDigitalPin(pin, 0);
      resolve(makeReply(action, { payload: { value } }));
    });
  });
};
