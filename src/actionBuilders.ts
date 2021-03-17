/**
 * Provides a collection of action builders to simplify building FSA (Flux Standard Action)
 * objects from a reduced set of parameters
 * @module
 */
import Board from 'firmata';
import { FSA } from './types';

/**
 *  Describes the FSA for the `pinMode` command
 * @exports
 * @typedef {object} pinModeFSA
 */
export type pinModeFSA = FSA<'pinMode', { pin: number; mode: Board.PIN_MODE }>;

/**
 * Builds the FSA for a `pinMode` command.
 * 
 * mode  can be one of these:
 * ```
  INPUT:    0,
  OUTPUT:   1,
  ANALOG:   2,
  PWM:      3,
  SERVO:    4,
  SHIFT:    5,
  I2C:      6,
  ONEWIRE:  7,
  STEPPER:  8,
  SERIAL:  10
  PULLUP:  11
  IGNORE: 127
  UNKOWN:  16
```
 * @export
 * @param {number} pin pin whose mode is to be changed
 * @param {Board.PIN_MODE} mode new mode to be set
 * @returns {pinModeFSA}
 */
export function pinModeActionBuilder(
  pin: number,
  mode: Board.PIN_MODE
): pinModeFSA {
  return {
    type: 'pinMode',
    payload: {
      pin,
      mode,
    },
  };
}

/**
 * Describes the FSA for the `digitalWrite` command
 * @exports
 * @typedef {object} digitalWriteFSA
 */
export type digitalWriteFSA = FSA<
  'digitalWrite',
  { pin: number; output: Board.PIN_STATE }
>;
/**
 * Builds the FSA for the `digitalWrite` command.
 *
 * @export
 * @param {number} pin pin number to set
 * @param {Board.PIN_STATE} output either 0 or 1,
 * @return {digitalWriteFSA}
 */
export function digitalWriteActionBuilder(
  pin: number,
  output: Board.PIN_STATE
): digitalWriteFSA {
  return {
    type: 'digitalWrite',
    payload: {
      pin,
      output,
    },
  };
}

/**
 * Describes the FSA for the `digitalRead` command
 * @exports
 * @typedef {object} digitalReadFSA
 */
export type digitalReadFSA = FSA<'digitalRead', { pin: number }>;

/**
 * Builds the FSA for the `digitalRead` command.
 *
 * @export
 * @param {number} pin pin to be read
 * @return {digitalReadFSA}
 */
export function digitalReadActionBuilder(pin: number): digitalReadFSA {
  return {
    type: 'digitalRead',
    payload: {
      pin,
    },
  };
}
/**
 * Helper function to produce a reply FSA from the given FSA in `requestAction`.
 * The original action is not modified.
 *
 * The second parameter `extra` may contain `payload`, `meta` and `error` properties.
 * These will be merged into the original action, if present.
 *
 * If the `extra` object contains an `error` property, it will add a `_error`
 * suffix to the original action `type`. Otherwise, it will add the `_reply` suffix.
 *
 * It will also add a `date` property to `meta` containing an ISO 8601 timestamp
 * for the current timestamp.
 * @export
 * @param {FSA} __namedParameters Original action to be replied to
 * @param {Omit<FSA, 'type'>} [__namedParameters={}] Object containing properties to be merged into reply
 * @return {FSA} a new FSA.
 */
export function makeReply(
  { type: rt, payload: rp, meta: rm }: FSA,
  { payload: xp, meta: xm, error }: Omit<FSA, 'type'> = {}
): FSA {
  const type = `${rt}_${error ? 'error' : 'reply'}`;
  const payload = xp
    ? {
        ...rp,
        ...xp,
      }
    : rp;
  const meta = {
    ...rm,
    ...xm,
    date: new Date().toISOString(),
  };
  return error
    ? {
        type,
        payload,
        meta,
        error,
      }
    : {
        type,
        payload,
        meta,
      };
}
