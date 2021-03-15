import Board from 'firmata';
import { config as envRead } from 'dotenv';
import fetch from 'node-fetch';

import './jest-setup.util';
import { start, stop } from './server';
import { FSA, ErrorCodes } from './types';
import {
  pinModeActionBuilder,
  digitalWriteActionBuilder,
  digitalReadActionBuilder,
} from './actionBuilders';

const LED_BUILTIN = 13;

const BAD_PIN = 999;
const BAD_MODE = 999;
envRead();

let board: Board;

beforeAll(async () => {
  const props = await start();
  board = props.board;
});

afterAll(stop);

const buildUrl = (path: string): string =>
  `http://localhost:${process.env.REACT_APP_HTTP_PORT}/${path}`;

const postCommand: (action: FSA) => Promise<FSA> = (action) =>
  fetch(
    buildUrl('command'),

    {
      method: 'post',
      body: JSON.stringify(action),
      headers: { 'Content-Type': 'application/json' },
    }
  ).then((res) => res.json());

describe('server commands', () => {
  describe('various gets', () => {
    test('version', async () => {
      const res = await fetch(buildUrl('version'));
      expect(await res.json()).toMatchInlineSnapshot(`
        Object {
          "name": "StandardFirmata.ino",
          "version": Object {
            "major": 2,
            "minor": 5,
          },
        }
      `);
    });
    test('AnalogPins', async () => {
      const res = await fetch(buildUrl('AnalogPins'));
      expect(await res.json()).toMatchInlineSnapshot(`
        Array [
          14,
          15,
          16,
          17,
          18,
          19,
        ]
      `);
    });
    test('DigitalPins', async () => {
      const res = await fetch(buildUrl('DigitalPins'));
      expect(await res.json()).toMatchInlineSnapshot(`20`);
    });
    test('Single DigitalPins', async () => {
      const res = await fetch(buildUrl('DigitalPins/1'));
      expect(await res.json()).toMatchInlineSnapshot(`
        Object {
          "analogChannel": 127,
          "report": 1,
          "supportedModes": Array [],
          "value": 0,
        }
      `);
    });
    test('Default index.html from public', async () => {
      const res = await fetch(buildUrl(''));
      expect(await res.text()).toMatchInlineSnapshot(`"<h1>Hello World!</h1>"`);
    });
    test('Some content from public', async () => {
      const res = await fetch(buildUrl('something.txt'));
      expect(await res.text()).toMatchInlineSnapshot(`
        "Hello World!
        "
      `);
    });
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
    test('read pin 2 with pullup', async () => {
      const modeAction = pinModeActionBuilder(2, board.MODES.PULLUP);
      const res1 = await postCommand(modeAction);
      expect(res1).toBeFSAReply(modeAction);

      const readAction = digitalReadActionBuilder(2);
      const res2 = await postCommand(readAction);
      expect(res2).toBeFSAReply(readAction);
      expect(res2.payload.value).toBe(board.HIGH);
    });
    test('bad pin', async () => {
      const modeAction = pinModeActionBuilder(2, board.MODES.PULLUP);
      const res1 = await postCommand(modeAction);
      expect(res1).toBeFSAReply(modeAction);

      const readAction = digitalReadActionBuilder(BAD_PIN);
      const res2 = await postCommand(readAction);
      expect(res2).toBeFSAReply(readAction);
      expect(res2).toHaveErrorCode(ErrorCodes.BAD_PIN);
    });
  });
});
