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

export function makeReply(request: FSA, extra: Omit<FSA, 'type'> = {}): FSA {
  return {
    type: `${request.type}_reply`,
    payload: {
      ...request.payload,
      ...(extra.payload || {}),
    },
    meta: {
      ...request.meta,
      ...(extra.meta || {}),
      date: new Date().toISOString(),
    },
    error: extra.error,
  };
}
