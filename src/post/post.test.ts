import fetch from 'node-fetch';
import Board from 'firmata';

import config from '../config.js';
import { start, stop } from '../server.js';

import { FSA, ErrorCodes } from '../types.js';
import {
  pinModeActionBuilder,
  digitalWriteActionBuilder,
  digitalReadActionBuilder,
} from '../actionBuilders.js';

import extendJest from '../jest-setup.util.js';

const buildUrl = (...path: (string | number)[]): string =>
  `http://localhost:${config.HTTP_PORT}/${path.join('/')}`;

const postCommand: (action: FSA) => Promise<FSA> = (action) =>
  fetch(
    buildUrl('command'),

    {
      method: 'post',
      body: JSON.stringify(action),
      headers: { 'Content-Type': 'application/json' },
    }
  ).then((res) => res.json());

const LED_BUILTIN = 13;
const INPUT_PIN = 2;

const BAD_PIN = 999;
const BAD_MODE = 999;

let board: Board;
beforeAll(() => {
  extendJest(expect);
  return start()
    .then((props) => {
      board = props.board;
    })
    .catch(() => {
      // If it fails here it probably means the board is not connected or powered
      process.exit(1);
    });
});

afterAll(stop);

test('bad command', async () => {
  const res = await postCommand({
    type: 'nonsense',
    payload: {},
  });
  expect(res).toMatchInlineSnapshot(`
    Object {
      "error": Object {
        "code": 1,
        "msg": "Invalid command",
      },
      "payload": Object {},
      "type": "nonsense",
    }
  `);
});

describe('pin mode', () => {
  test('pin mode', async () => {
    const action = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    const res = await postCommand(action);
    expect(res).toBeFSAReply(action);
  });

  test('bad pin', async () => {
    const action = pinModeActionBuilder(BAD_PIN, board.MODES.OUTPUT);
    const res = await postCommand(action);
    expect(res).toBeFSAReply(action);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('bad mode', async () => {
    const action = pinModeActionBuilder(LED_BUILTIN, BAD_MODE);
    const res = await postCommand(action);
    expect(res).toBeFSAReply(action);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_MODE);
  });
});
describe('digitalWrite', () => {
  test('pin high', async () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    const res1 = await postCommand(modeAction);
    expect(res1).toBeFSAReply(modeAction);

    const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, board.HIGH);
    const res2 = await postCommand(writeHigh);
    expect(res2).toBeFSAReply(writeHigh);
  });

  test('pin low', async () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    const res1 = await postCommand(modeAction);
    expect(res1).toBeFSAReply(modeAction);

    const writeLow = digitalWriteActionBuilder(LED_BUILTIN, board.LOW);
    const res2 = await postCommand(writeLow);
    expect(res2).toBeFSAReply(writeLow);
  });

  test('bad pin', async () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    const res1 = await postCommand(modeAction);
    expect(res1).toBeFSAReply(modeAction);

    const writeHigh = digitalWriteActionBuilder(BAD_PIN, board.HIGH);
    const res2 = await postCommand(writeHigh);
    expect(res2).toBeFSAReply(writeHigh);
    expect(res2).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('bad value', async () => {
    const modeAction = pinModeActionBuilder(LED_BUILTIN, board.MODES.OUTPUT);
    const res1 = await postCommand(modeAction);
    expect(res1).toBeFSAReply(modeAction);

    const writeHigh = digitalWriteActionBuilder(LED_BUILTIN, 999);
    const res2 = await postCommand(writeHigh);
    expect(res2).toBeFSAReply(writeHigh);
    expect(res2).toHaveErrorCode(ErrorCodes.BAD_OUTPUT);
  });
});
describe('digitalRead', () => {
  test('read pin INPUT_PIN with pullup', async () => {
    const modeAction = pinModeActionBuilder(INPUT_PIN, board.MODES.PULLUP);
    const res1 = await postCommand(modeAction);
    expect(res1).toBeFSAReply(modeAction);

    const readAction = digitalReadActionBuilder(INPUT_PIN);
    const res2 = await postCommand(readAction);
    expect(res2).toBeFSAReply(readAction);
    expect(res2.payload.value).toBe(board.HIGH);
  });
  test('bad pin', async () => {
    const modeAction = pinModeActionBuilder(INPUT_PIN, board.MODES.PULLUP);
    const res1 = await postCommand(modeAction);
    expect(res1).toBeFSAReply(modeAction);

    const readAction = digitalReadActionBuilder(BAD_PIN);
    const res2 = await postCommand(readAction);
    expect(res2).toBeFSAReply(readAction);
    expect(res2).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });
});
