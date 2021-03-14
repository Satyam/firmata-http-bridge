import Board from 'firmata';
import { config as envRead } from 'dotenv';

import { pinMode, digitalWrite } from './pinCommands';

import {
  pinModeActionBuilder,
  digitalWriteActionBuilder,
} from './actionBuilders';
import { ErrorCodes } from './types';

const LED_BUILTIN = 13;

envRead();

let board: Board;

beforeAll((done) => {
  board = new Board(process.env.REACT_APP_USB_PORT);
  board.on('ready', done);
});

afterEach(() => board.reset());

afterAll((done) => {
  // @ts-ignore
  board.transport.close(done);
});

describe('pinMode', () => {
  test('valid mode', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);

    expect(board.pins[LED_BUILTIN].mode).toBeUndefined();
    expect(pinMode(board, modeAction)).toBe(modeAction);
    expect(board.pins[LED_BUILTIN].mode).toBe(board.MODES.OUTPUT);
  });

  test('invalid pin', () => {
    const modeAction = pinModeActionBuilder(999, board.MODES.OUTPUT);

    const response = pinMode(board, modeAction);
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
  });

  test('invalid mode', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, 999);
    const response = pinMode(board, modeAction);
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code', ErrorCodes.BAD_MODE);
  });
});

describe('digitalWrite', () => {
  test('pin high', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, board.HIGH);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.LOW);
    expect(digitalWrite(board, writeHigh)).toBe(writeHigh);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.HIGH);
  });

  test('pin low', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeLow = digitalWriteActionBuilder(LED_BUILTIN, board.LOW);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.HIGH);
    expect(digitalWrite(board, writeLow)).toBe(writeLow);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.LOW);
  });

  test('bad pin', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = digitalWriteActionBuilder(999, board.HIGH);
    const result = digitalWrite(board, writeHigh);
    expect(result).toHaveProperty('error');
    expect(result.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
  });

  test('bad value', () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, 999);
    const result = digitalWrite(board, writeHigh);
    expect(result).toHaveProperty('error');
    expect(result.error).toHaveProperty('code', ErrorCodes.BAD_OUTPUT);
  });

  test('blink', (done) => {
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
