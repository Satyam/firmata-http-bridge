import { io, Socket } from 'socket.io-client';

import { board, config } from '../config.js';
import { start, stop } from '../server.js';

import { FSA, ErrorCodes } from '../types.js';
import {
  pinModeActionBuilder,
  digitalWriteActionBuilder,
  digitalReadActionBuilder,
  digitalReadSubscribeActionBuilder,
  digitalReadUnsubscribeActionBuilder,
} from '../actionBuilders.js';

import extendJest from '../jest-setup.util.js';

const BAD_PIN = 999;
const BAD_MODE = 999;

const INPUT_PIN = config.TEST_DIGITAL_INPUT_PIN;
const OUTPUT_PIN = config.TEST_DIGITAL_OUTPUT_PIN;

const SERVER = `http://localhost:${config.HTTP_PORT}`;

let socket: Socket;

const postCommand: (action: FSA) => Promise<FSA> = (action) =>
  new Promise((resolve) => {
    socket.once('reply', (res: string) => resolve(JSON.parse(res)));
    socket.emit('command', JSON.stringify(action));
  });

const outputModeAction = pinModeActionBuilder(OUTPUT_PIN, board.MODES.OUTPUT);

const writeHigh = digitalWriteActionBuilder(OUTPUT_PIN, board.HIGH);
const writeLow = digitalWriteActionBuilder(OUTPUT_PIN, board.LOW);

const inputModeAction = pinModeActionBuilder(INPUT_PIN, board.MODES.PULLUP);

const readSubscribeAction = digitalReadSubscribeActionBuilder(INPUT_PIN);
const readUnsubscribeAction = digitalReadUnsubscribeActionBuilder(INPUT_PIN);
const readAction = digitalReadActionBuilder(INPUT_PIN);

beforeAll(() => {
  extendJest(expect);
  return start()
    .then(
      () =>
        new Promise<void>((resolve) => {
          socket = io(SERVER);
          socket.once('hello', (msg) => {
            expect(msg).toBe('world');
            resolve();
          });
          socket.on('connect', () => {
            expect(typeof socket.id).toBe('string');
            expect(socket.id.length).toBeGreaterThan(0);
          });
        })
    )
    .catch((error) => {
      // If it fails here it probably means the board is not connected or powered
      process.stdout.write('', () =>
        process.stderr.write(`Server start: ${error}`, () => process.exit(1))
      );
    });
});

afterAll(() => {
  stop();
  socket.close();
});
test('bad command', async () => {
  const res = await postCommand({
    type: 'nonsense',
    payload: {},
  });
  expect(res).toEqual({
    error: { code: 1, msg: 'Invalid command' },
    payload: {},
    type: 'nonsense',
  });
});

describe('pin mode', () => {
  test('pin mode', async () => {
    const res = await postCommand(outputModeAction);
    expect(res).toBeFSAReply(outputModeAction);
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
    const res = await postCommand(outputModeAction);
    expect(res).toBeFSAReply(outputModeAction);
  });

  test('pin high', async () => {
    const res = await postCommand(writeHigh);
    expect(res).toBeFSAReply(writeHigh);
  });

  test('pin low', async () => {
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
    const res = await postCommand(inputModeAction);
    expect(res).toBeFSAReply(inputModeAction);
  });

  test(`read pin ${INPUT_PIN} with pullup`, async () => {
    const res = await postCommand(readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res.payload.value).toBe(board.HIGH);
  });

  test('bad pin', async () => {
    const readActionBadPin = digitalReadActionBuilder(BAD_PIN);
    const res = await postCommand(readActionBadPin);
    expect(res).toBeFSAReply(readActionBadPin);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });
});

describe('digitalRead by subscription', () => {
  beforeAll(async () => {
    const res = await postCommand(inputModeAction);
    expect(res).toBeFSAReply(inputModeAction);
  });

  test(`Subscribe to read pin ${INPUT_PIN} with pullup`, (done) => {
    let stage = 0;
    const listener = (res: string) => {
      const fsa: FSA = JSON.parse(res);
      switch (stage) {
        case 0:
          expect(fsa).toBeFSAReply(readSubscribeAction);
          break;
        case 1:
          expect(fsa).toBeFSAReply(readAction);
          expect(fsa.payload.value).toBe(board.HIGH);
          socket.emit('command', JSON.stringify(readUnsubscribeAction));
          break;
        case 2:
          expect(fsa).toBeFSAReply(readUnsubscribeAction);
          socket.off('reply', listener);
          done();
          break;
        default:
          expect(true).toBeFalsy();
          break;
      }
      stage += 1;
    };

    socket.on('reply', listener);
    socket.emit('command', JSON.stringify(readSubscribeAction));
  });

  test(`Subscribe twice to read pin `, (done) => {
    let stage = 0;
    const listener = (res: string) => {
      const fsa: FSA = JSON.parse(res);
      switch (stage) {
        case 0:
          expect(fsa).toBeFSAReply(readSubscribeAction);
          break;
        case 1:
          expect(fsa).toBeFSAReply(readSubscribeAction);
          expect(fsa.meta.alreadySubscribed).toBeTruthy();
          break;
        case 2:
          expect(fsa).toBeFSAReply(readAction);
          expect(fsa.payload.value).toBe(board.HIGH);
          socket.emit('command', JSON.stringify(readUnsubscribeAction));
          break;
        case 3:
          expect(fsa).toBeFSAReply(readUnsubscribeAction);
          socket.off('reply', listener);
          done();
          break;
        default:
          done(`Unexpected stage ${stage}`);
          break;
      }
      stage += 1;
    };

    socket.on('reply', listener);
    socket.emit('command', JSON.stringify(readSubscribeAction));
    socket.emit('command', JSON.stringify(readSubscribeAction));
  });

  test(`Mix simple read with subscription`, (done) => {
    let subscribed = false;
    let digitalReadReplies = 0;
    let unsubscribed = false;

    const listener = (res: string) => {
      const fsa: FSA = JSON.parse(res);
      switch (fsa.type) {
        case 'digitalReadSubscribe_reply':
          expect(fsa).toBeFSAReply(readSubscribeAction);
          socket.emit('command', JSON.stringify(readAction));
          subscribed = true;
          break;
        case 'digitalRead_reply':
          expect(fsa).toBeFSAReply(readAction);
          expect(fsa.payload.value).toBe(board.HIGH);
          digitalReadReplies += 1;
          if (digitalReadReplies == 2) {
            socket.emit('command', JSON.stringify(readUnsubscribeAction));
          }
          break;
        case 'digitalReadUnsubscribe_reply':
          expect(fsa).toBeFSAReply(readUnsubscribeAction);
          socket.off('reply', listener);
          unsubscribed = true;
          break;
        default:
          done(`Unexpected reply on ${res}`);
          break;
      }
      if (subscribed && unsubscribed && digitalReadReplies > 1) done();
    };

    socket.on('reply', listener);
    socket.emit('command', JSON.stringify(readSubscribeAction));
  });
});
