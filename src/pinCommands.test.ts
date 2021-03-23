import Board from 'firmata';

import extendJest from './jest-setup.util.js';

import config from './config.js';
import { board } from './serverSetup.js';

import { pinMode, digitalWrite, digitalRead } from './pinCommands.js';
import {
  pinModeActionBuilder,
  digitalWriteActionBuilder,
  digitalReadActionBuilder,
  makeReply,
} from './actionBuilders.js';
import { ErrorCodes } from './types.js';

const LED_BUILTIN = 13;

const BAD_PIN = 999;
const BAD_MODE = 999;

beforeAll((done) => {
  extendJest(expect);
  board.on('ready', done);
  board.on('error', (error) => {
    console.error(error);
    done(error);
    // If it fails here it probably means the board is not connected or powered
    // process.exit(1);
  });
});

afterEach(() => board.reset());

afterAll((done) => {
  // @ts-ignore
  board.transport.close(done);
});

describe('pinMode', () => {
  test('toBeFSAReply', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);

    expect(makeReply(modeAction)).toBeFSAReply(modeAction);
    expect(modeAction).not.toBeFSAReply(modeAction);
  });

  test('valid mode', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);

    expect(board.pins[LED_BUILTIN].mode).toBeUndefined();
    expect(pinMode(board, modeAction)).toBeFSAReply(modeAction);
    expect(board.pins[LED_BUILTIN].mode).toBe(board.MODES.OUTPUT);
  });

  test('invalid pin', () => {
    const modeAction = pinModeActionBuilder(BAD_PIN, board.MODES.OUTPUT);

    const response = pinMode(board, modeAction);
    expect(response).toBeFSAReply(modeAction);
    expect(response).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('invalid mode', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, BAD_MODE);
    const response = pinMode(board, modeAction);
    expect(response).toBeFSAReply(modeAction);
    expect(response).toHaveErrorCode(ErrorCodes.BAD_MODE);
  });
});

describe('digitalWrite', () => {
  test('pin high', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, board.HIGH);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.LOW);
    expect(digitalWrite(board, writeHigh)).toBeFSAReply(writeHigh);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.HIGH);
  });

  test('pin low', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeLow = digitalWriteActionBuilder(LED_BUILTIN, board.LOW);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.HIGH);
    expect(digitalWrite(board, writeLow)).toBeFSAReply(writeLow);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.LOW);
  });

  test('bad pin', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = digitalWriteActionBuilder(BAD_PIN, board.HIGH);
    const result = digitalWrite(board, writeHigh);
    expect(result).toBeFSAReply(writeHigh);
    expect(result).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('bad value', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, BAD_MODE);
    const result = digitalWrite(board, writeHigh);
    expect(result).toBeFSAReply(writeHigh);
    expect(result).toHaveErrorCode(ErrorCodes.BAD_OUTPUT);
  });

  test.skip('blink', (done) => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);
    const writeLow = digitalWriteActionBuilder(LED_BUILTIN, board.LOW);
    const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, board.HIGH);

    digitalWrite(board, writeLow);
    let i: number;
    for (i = 1; i < 9; i++) {
      setTimeout(
        () => digitalWrite(board, i & 1 ? writeHigh : writeLow),
        i * 500
      );
    }
    setTimeout(done, 500 * i);
  });
});
describe('digitalRead', () => {
  test('read pin 2 with pullup', async () => {
    const modeAction = pinModeActionBuilder(2, board.MODES.PULLUP);
    pinMode(board, modeAction);

    const readAction = digitalReadActionBuilder(2);
    const res = await digitalRead(board, readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res.payload.value).toBe(board.HIGH);
  });
  test('bad pin', async () => {
    const modeAction = pinModeActionBuilder(2, board.MODES.PULLUP);
    pinMode(board, modeAction);

    const readAction = digitalReadActionBuilder(BAD_PIN);
    const res = await digitalRead(board, readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });
});
