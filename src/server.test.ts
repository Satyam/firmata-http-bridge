import Board from 'firmata';
import { config as envRead } from 'dotenv';
import fetch from 'node-fetch';
import { start, stop } from './server';
import { FSA, ErrorCodes } from './types';
import {
  pinModeActionBuilder,
  digitalWriteActionBuilder,
} from './actionBuilders';

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

describe('server commands', () => {
  describe('pin mode', () => {
    test('pin mode', async () => {
      const action = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
      const res = await postCommand(action);
      expect(res).toStrictEqual(action);
    });

    test('bad pin', async () => {
      const action = pinModeActionBuilder(999, board.MODES.OUTPUT);
      const res = await postCommand(action);
      expect(res).toHaveProperty('error');
      expect(res.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
    });

    test('bad mode', async () => {
      const action = pinModeActionBuilder(LED_BUILTIN, 999);
      const res = await postCommand(action);
      expect(res).toHaveProperty('error');
      expect(res.error).toHaveProperty('code', ErrorCodes.BAD_MODE);
    });
  });
  describe('digitalWrite', () => {
    test('pin high', async () => {
      const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, board.HIGH);
      const res2 = await postCommand(writeHigh);
      expect(res2).toStrictEqual(writeHigh);
    });

    test('pin low', async () => {
      const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeLow = digitalWriteActionBuilder(LED_BUILTIN, board.LOW);
      const res2 = await postCommand(writeLow);
      expect(res2).toStrictEqual(writeLow);
    });

    test('bad pin', async () => {
      const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeHigh = digitalWriteActionBuilder(999, board.HIGH);
      const res2 = await postCommand(writeHigh);
      expect(res2).toHaveProperty('error');
      expect(res2.error).toHaveProperty('code', ErrorCodes.BAD_PIN);
    });

    test('bad value', async () => {
      const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
      const res1 = await postCommand(modeAction);
      expect(res1).toStrictEqual(modeAction);

      const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, 999);
      const res2 = await postCommand(writeHigh);
      expect(res2).toHaveProperty('error');
      expect(res2.error).toHaveProperty('code', ErrorCodes.BAD_OUTPUT);
    });
  });
});
