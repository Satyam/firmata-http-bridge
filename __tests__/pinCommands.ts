import Board from 'firmata';
import { config as envRead } from 'dotenv';

import {
  pinMode,
  pinModeFSA,
  digitalWrite,
  digitalWriteFSA,
} from '../src/pinCommands';
import { ErrorCodes } from '../src/types';

const LED_BUILTIN = 13;

envRead();

let board: Board;

beforeAll((done) => {
  board = new Board(process.env.REACT_APP_USB_PORT);
  board.on('ready', done);
});

afterEach(() => board.reset());

const buildModeAction = (
  mode: Board.PIN_MODE,
  pin: number = LED_BUILTIN
): pinModeFSA => ({
  type: 'pinMode',
  payload: {
    pin,
    mode,
  },
});

describe('pinMode', () => {
  test('valid mode', () => {
    const modeAction = buildModeAction(board.MODES.OUTPUT);

    expect(board.pins[LED_BUILTIN].mode).toBeUndefined();
    expect(pinMode(board, modeAction)).toBe(modeAction);
    expect(board.pins[LED_BUILTIN].mode).toBe(board.MODES.OUTPUT);
  });

  test('invalid pin', () => {
    const modeAction = buildModeAction(board.MODES.OUTPUT, 999);

    const response = pinMode(board, modeAction);
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
  });

  test('invalid mode', () => {
    const modeAction = buildModeAction(999);
    const response = pinMode(board, modeAction);
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code', ErrorCodes.BAD_MODE);
  });
});

describe('digitalWrite', () => {
  const buildWriteAction = (
    output: Board.PIN_STATE,
    pin: number = LED_BUILTIN
  ): digitalWriteFSA => ({
    type: 'digitalWrite',
    payload: {
      pin,
      output,
    },
  });

  test('pin high', () => {
    const modeAction = buildModeAction(board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = buildWriteAction(board.HIGH);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.LOW);
    expect(digitalWrite(board, writeHigh)).toBe(writeHigh);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.HIGH);
  });

  test('pin low', () => {
    const modeAction = buildModeAction(board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeLow = buildWriteAction(board.LOW);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.HIGH);
    console.log(board.pins[LED_BUILTIN]);
    expect(digitalWrite(board, writeLow)).toBe(writeLow);
    expect(board.pins[LED_BUILTIN].value).toEqual(board.LOW);
  });

  test('bad pin', () => {
    const modeAction = buildModeAction(board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = buildWriteAction(board.HIGH, 999);
    const result = digitalWrite(board, writeHigh);
    expect(result).toHaveProperty('error');
    expect(result.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
  });

  test('bad value', () => {
    const modeAction = buildModeAction(board.MODES.OUTPUT);
    pinMode(board, modeAction);

    const writeHigh = buildWriteAction(999);
    const result = digitalWrite(board, writeHigh);
    expect(result).toHaveProperty('error');
    expect(result.error).toHaveProperty('code', ErrorCodes.BAD_OUTPUT);
  });

  test('blink', (done) => {
    const modeAction = buildModeAction(board.MODES.OUTPUT);
    pinMode(board, modeAction);
    const writeLow = buildWriteAction(board.LOW);
    const writeHigh = buildWriteAction(board.HIGH);

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
