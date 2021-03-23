/**
 * Functions to send the FSA commands to the board
 * @module
 */
import { validDigitalPin, validMode, validOutput } from './utils.js';
import type Board from 'firmata';
import type { Socket } from 'socket.io';
import type {
  digitalWriteFSA,
  pinModeFSA,
  digitalReadFSA,
  digitalReadSubscribeFSA,
  digitalReadUnsubscribeFSA,
} from './actionBuilders.js';

import { FSA, ErrorCodes } from './types.js';
import { makeReply } from './actionBuilders.js';
import { app } from './serverSetup.js';

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

/**
 * Sends the `digitalReadSubscribeFSA` action type to the given board.
 * It is best to use [[digitalReadSubscribeActionBuilder]] to build the action
 *
 * This function returns a reply FSA without the value requested.
 * The value will be sent, via sockets, as they come.
 * To cancel reporting on new values, call [[`digitalReadUnsubscribe`]]
 * If an error is detected if will immediately return an error FSA.
 * @exports
 * @param board - Board to send the command to
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const digitalReadSubscribe: Commands<digitalReadSubscribeFSA> = (
  board,
  action
) => {
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

  const socket = app.get('socket') as Socket;
  board.digitalRead(pin, (value) => {
    socket.emit(
      'reply',
      JSON.stringify(makeReply(action, { payload: { value } }))
    );
  });
  return makeReply(action);
};

/**
 * Sends the `digitalReadUnsubscribeFSA` action type to the given board.
 * It is best to use [[digitalReadUnsubscribeActionBuilder]] to build the action
 *
 * This function stops a previous [[digitalReadSubscribe]] command.
 * If an error is detected if will immediately return an error FSA.
 * @exports
 * @param board - Board to send the command to
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const digitalReadUnsubscribe: Commands<digitalReadUnsubscribeFSA> = (
  board,
  action
) => {
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

  board.reportDigitalPin(pin, 0);
  return makeReply(action);
};
