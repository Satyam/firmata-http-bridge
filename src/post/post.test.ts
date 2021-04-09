import fetch from 'node-fetch';

import { board, config } from '../config.js';
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

const BAD_PIN = 999;
const BAD_MODE = 999;

const INPUT_PIN = config.TEST_DIGITAL_INPUT_PIN;
const OUTPUT_PIN = config.TEST_DIGITAL_OUTPUT_PIN;

beforeAll(() => {
  extendJest(expect);
  return start().catch(() => {
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
    const action = pinModeActionBuilder(OUTPUT_PIN, board.MODES.OUTPUT);
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
    const action = pinModeActionBuilder(OUTPUT_PIN, BAD_MODE);
    const res = await postCommand(action);
    expect(res).toBeFSAReply(action);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_MODE);
  });
});

describe('digitalWrite', () => {
  beforeAll(async () => {
    const modeAction = pinModeActionBuilder(OUTPUT_PIN, board.MODES.OUTPUT);
    const res = await postCommand(modeAction);
    expect(res).toBeFSAReply(modeAction);
  });

  test('pin high', async () => {
    const writeHigh = digitalWriteActionBuilder(OUTPUT_PIN, board.HIGH);
    const res = await postCommand(writeHigh);
    expect(res).toBeFSAReply(writeHigh);
  });

  test('pin low', async () => {
    const writeLow = digitalWriteActionBuilder(OUTPUT_PIN, board.LOW);
    const res = await postCommand(writeLow);
    expect(res).toBeFSAReply(writeLow);
  });

  test('bad pin', async () => {
    const writeHigh = digitalWriteActionBuilder(BAD_PIN, board.HIGH);
    const res = await postCommand(writeHigh);
    expect(res).toBeFSAReply(writeHigh);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('bad value', async () => {
    const writeHigh = digitalWriteActionBuilder(OUTPUT_PIN, 999);
    const res = await postCommand(writeHigh);
    expect(res).toBeFSAReply(writeHigh);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_OUTPUT);
  });
});

describe('digitalRead', () => {
  beforeAll(async () => {
    const modeAction = pinModeActionBuilder(INPUT_PIN, board.MODES.PULLUP);
    const res = await postCommand(modeAction);
    expect(res).toBeFSAReply(modeAction);
  });

  test(`read pin ${INPUT_PIN} with pullup`, async () => {
    const readAction = digitalReadActionBuilder(INPUT_PIN);
    const res = await postCommand(readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res.payload.value).toBe(board.HIGH);
  });

  test('bad pin', async () => {
    const readAction = digitalReadActionBuilder(BAD_PIN);
    const res = await postCommand(readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });
});
