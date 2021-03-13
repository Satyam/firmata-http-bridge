import Board from 'firmata';
import { config as envRead } from 'dotenv';
import fetch from 'node-fetch';
import { start, stop } from './server';
import { FSA, ErrorCodes } from './types';
import { pinModeFSA, digitalWriteFSA } from './pinCommands';

const LED_BUILTIN = 13;

envRead();

let board: Board;

beforeAll(async () => {
  const props = await start();
  board = props.board;
});

afterAll(stop);

const postCommand: (action: FSA) => Promise<FSA> = (action) =>
  fetch(
    `http://localhost:${process.env.REACT_APP_HTTP_PORT}/command`,

    {
      method: 'post',
      body: JSON.stringify(action),
      headers: { 'Content-Type': 'application/json' },
    }
  ).then((res) => res.json());

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

describe('server commands', () => {
  describe('pin mode', () => {
    test('pin mode', async () => {
      const action = buildModeAction(board.MODES.OUTPUT);
      const res = await postCommand(action);
      expect(res).toStrictEqual(action);
    });

    test('bad pin', async () => {
      const action = buildModeAction(board.MODES.OUTPUT, 999);
      const res = await postCommand(action);
      expect(res).toHaveProperty('error');
      expect(res.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
    });

    test('bad mode', async () => {
      const action = buildModeAction(999);
      const res = await postCommand(action);
      expect(res).toHaveProperty('error');
      expect(res.error).toHaveProperty('code', ErrorCodes.BAD_MODE);
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

    test('pin high', async () => {
      const modeAction = buildModeAction(board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeHigh = buildWriteAction(board.HIGH);
      const res2 = await postCommand(writeHigh);
      expect(res2).toStrictEqual(writeHigh);
    });

    test('pin low', async () => {
      const modeAction = buildModeAction(board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeLow = buildWriteAction(board.LOW);
      const res2 = await postCommand(writeLow);
      expect(res2).toStrictEqual(writeLow);
    });

    test('bad pin', async () => {
      const modeAction = buildModeAction(board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeHigh = buildWriteAction(board.HIGH, 999);
      const res2 = await postCommand(writeHigh);
      expect(res2).toHaveProperty('error');
      expect(res2.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
    });

    test('bad value', async () => {
      const modeAction = buildModeAction(board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeHigh = buildWriteAction(999);
      const res2 = await postCommand(writeHigh);
      expect(res2).toHaveProperty('error');
      expect(res2.error).toHaveProperty('code', ErrorCodes.BAD_OUTPUT);
    });
  });
});
