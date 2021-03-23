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
import { app, board } from './serverSetup.js';

type ImmediateCommand<F extends FSA = FSA, Meta = any> = (action: F) => FSA;

type PromiseCommand<F extends FSA = FSA, Meta = any> = (
  action: F
) => Promise<FSA>;
/**
 * Describes the format of the commands dispatched from the web server.
 * @typeParam F the shape of the FSA used in this command
 * @typeParam Meta the shape of extra `meta` properties
 */
export type Commands<F extends FSA = FSA, Meta = any> =
  | ImmediateCommand<F, Meta>
  | PromiseCommand<F, Meta>;

/**
 * Accepts the `pinModeFSA` action type and sets the given pin on the board.
 * It is best to use [[pinModeActionBuilder]] to build the action
 *
 * This function returns immediately (not a Promise) with an FSA
 * either an ordinary reply or an error reply
 * @exports
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const pinMode: ImmediateCommand<pinModeFSA> = (action) => {
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
 * Accepts a `digitalWriteFSA` action and sets the given pin to the given value.
 * It is best to use [[digitalWriteActionBuilder]] to build the action
 *
 * This function returns immediately (not a Promise) with an FSA
 * either an ordinary reply or an error one
 * @exports
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const digitalWrite: ImmediateCommand<digitalWriteFSA> = (action) => {
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
 * Accepts a `digitalReadFSA` action and reads a single value on that pin.
 * It is best to use [[digitalReadActionBuilder]] to build the action
 *
 * This function returns a `Promise` resolved to a reply FSA containing the value read
 * or an error FSA if an invalid pin is given.
 * @exports
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const digitalRead: PromiseCommand<digitalReadFSA> = (action) => {
  const {
    payload: { pin },
  } = action;
  return new Promise((resolve) => {
    if (!validDigitalPin(board, pin)) {
      resolve(
        makeReply(action, {
          error: {
            code: ErrorCodes.BAD_PIN,
            msg: 'Invalid pin',
          },
        })
      );
      return;
    }
    board.digitalRead(pin, (value) => {
      board.reportDigitalPin(pin, 0);
      resolve(makeReply(action, { payload: { value } }));
    });
  });
};

/**
 * Accepts a `digitalReadSubscribeFSA` action to susbscribe to digital reads
 * on the given pin.
 * It is best to use [[digitalReadSubscribeActionBuilder]] to build the action
 *
 * This does not read the value. It sends a reply FSA confirming the subscription.
 * The values will be sent, every time there is a change,
 * via sockets, as an emitted message with `reply` as
 * the `eventName` and the reply FSA with the value JSON-encoded.
 *
 * To cancel reporting on new values, call [[`digitalReadUnsubscribe`]]
 * If an error is detected if will immediately return an error FSA.
 * @exports
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const digitalReadSubscribe: ImmediateCommand<digitalReadSubscribeFSA> = (
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
 * Accepts a `digitalReadUnsubscribeFSA` action to unsubscribe from a read subscribtion on the given pin.
 * It is best to use [[digitalReadUnsubscribeActionBuilder]] to build the action
 *
 * This function stops a previous [[digitalReadSubscribe]] command.
 * If an error is detected if will immediately return an error FSA.
 * @exports
 * @param action - FSA action to send
 * @returns {FSA} A reply FSA
 */
export const digitalReadUnsubscribe: ImmediateCommand<digitalReadUnsubscribeFSA> = (
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
