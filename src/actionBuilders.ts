import Board from 'firmata';
import { FSA } from './types';

export type pinModeFSA = FSA<'pinMode', { pin: number; mode: Board.PIN_MODE }>;

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

export type digitalWriteFSA = FSA<
  'digitalWrite',
  { pin: number; output: Board.PIN_STATE }
>;

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

export type digitalReadFSA = FSA<'digitalRead', { pin: number }>;

export function digitalReadActionBuilder(pin: number): digitalReadFSA {
  return {
    type: 'digitalRead',
    payload: {
      pin,
    },
  };
}

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
