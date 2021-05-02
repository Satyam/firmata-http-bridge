import extendJest from './jest-setup.util.js';

import { board, config } from './config.js';

import {
  pinMode,
  digitalWrite,
  digitalRead,
  digitalReadSubscribe,
  digitalReadUnsubscribe,
} from './pinCommands.js';

import {
  pinModeActionBuilder,
  digitalWriteActionBuilder,
  digitalReadActionBuilder,
  digitalReadSubscribeActionBuilder,
  digitalReadUnsubscribeActionBuilder,
} from './actionBuilders.js';

import { ErrorCodes } from './types.js';

const BAD_PIN = 999;
const BAD_MODE = 999;
const INPUT_PIN = config.TEST_DIGITAL_INPUT_PIN;
const OUTPUT_PIN = config.TEST_DIGITAL_OUTPUT_PIN;

const outputModeAction = pinModeActionBuilder(OUTPUT_PIN, board.MODES.OUTPUT);

const writeHigh = digitalWriteActionBuilder(OUTPUT_PIN, board.HIGH);
const writeLow = digitalWriteActionBuilder(OUTPUT_PIN, board.LOW);

const inputModeAction = pinModeActionBuilder(INPUT_PIN, board.MODES.PULLUP);

const readSubscribeAction = digitalReadSubscribeActionBuilder(INPUT_PIN);
const readUnsubscribeAction = digitalReadUnsubscribeActionBuilder(INPUT_PIN);
const readAction = digitalReadActionBuilder(INPUT_PIN);

beforeAll((done) => {
  extendJest(expect);
  board.once('ready', done);
  board.on('error', (error) => {
    console.error(error);
    // If it fails here it probably means the board is not connected or powered
    process.stdout.write('', () =>
      process.stderr.write(`board error: ${error}`, () => process.exit(1))
    );
  });
});

afterAll((done) =>
  board.close((error) => {
    /* istanbul ignore if */
    if (error) {
      console.error('Closing board', error);
      process.stdout.write('', () => {
        process.stderr.write(`Server start: ${error}`, () => done(error));
      });
    } else done();
  })
);

describe('pinMode', () => {
  test('valid mode', () => {
    expect(board.pins[OUTPUT_PIN].mode).toBeUndefined();
    expect(pinMode(outputModeAction)).toBeFSAReply(outputModeAction);
    expect(board.pins[OUTPUT_PIN].mode).toBe(board.MODES.OUTPUT);
  });

  test('invalid pin', () => {
    const modeAction = pinModeActionBuilder(BAD_PIN, board.MODES.OUTPUT);

    const response = pinMode(modeAction);
    expect(response).toBeFSAReply(modeAction);
    expect(response).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('invalid mode', () => {
    const modeAction = pinModeActionBuilder(OUTPUT_PIN, BAD_MODE);
    const response = pinMode(modeAction);
    expect(response).toBeFSAReply(modeAction);
    expect(response).toHaveErrorCode(ErrorCodes.BAD_MODE);
  });
});

describe('digitalWrite', () => {
  beforeAll(() => {
    pinMode(outputModeAction);
  });

  test('pin high', () => {
    expect(board.pins[OUTPUT_PIN].value).toEqual(board.LOW);
    expect(digitalWrite(writeHigh)).toBeFSAReply(writeHigh);
    expect(board.pins[OUTPUT_PIN].value).toEqual(board.HIGH);
  });

  test('pin low', () => {
    expect(board.pins[OUTPUT_PIN].value).toEqual(board.HIGH);
    expect(digitalWrite(writeLow)).toBeFSAReply(writeLow);
    expect(board.pins[OUTPUT_PIN].value).toEqual(board.LOW);
  });

  test('bad pin', () => {
    const writeHigh = digitalWriteActionBuilder(BAD_PIN, board.HIGH);
    const result = digitalWrite(writeHigh);
    expect(result).toBeFSAReply(writeHigh);
    expect(result).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('bad value', () => {
    const writeHigh = digitalWriteActionBuilder(OUTPUT_PIN, BAD_MODE);
    const result = digitalWrite(writeHigh);
    expect(result).toBeFSAReply(writeHigh);
    expect(result).toHaveErrorCode(ErrorCodes.BAD_OUTPUT);
  });
});

describe('digitalRead', () => {
  beforeAll(() => {
    pinMode(inputModeAction);
  });

  test(`read pin ${INPUT_PIN} with pullup`, async () => {
    const res = await digitalRead(readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res.payload.value).toBe(board.HIGH);
  });

  test('bad pin', async () => {
    const readAction = digitalReadActionBuilder(BAD_PIN);
    const res = await digitalRead(readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });
});

describe('digitalReadSubscription', () => {
  beforeAll(() => {
    pinMode(inputModeAction);
  });

  test(`Subscribe to read pin ${INPUT_PIN} with pullup`, (done) => {
    const callback = (value: number) => {
      expect(value).toBe(board.HIGH);
      const res2 = digitalReadUnsubscribe(readUnsubscribeAction, callback);
      expect(res2).toBeFSAReply(readUnsubscribeAction);
      expect(board.digitalReaders[INPUT_PIN]).toBe(0);
      done();
    };

    expect(board.digitalReaders[INPUT_PIN]).toBe(0);
    const res1 = digitalReadSubscribe(readSubscribeAction, callback);
    expect(res1).toBeFSAReply(readSubscribeAction);

    expect(board.digitalReaders[INPUT_PIN]).toBe(1);
  });

  test(`Subscribe twice to read pin ${INPUT_PIN} with same callback`, (done) => {
    const mockCallback = jest.fn((value: number) => {
      const resU = digitalReadUnsubscribe(readUnsubscribeAction, mockCallback);
      expect(resU).toBeFSAReply(readUnsubscribeAction);
      expect(board.digitalReaders[INPUT_PIN]).toBe(0);
      expect(mockCallback).toBeCalledTimes(1);
      expect(mockCallback).toBeCalledWith(board.HIGH);
      expect(value).toBe(board.HIGH);
      done();
    });
    expect(board.digitalReaders[INPUT_PIN]).toBe(0);

    const res1 = digitalReadSubscribe(readSubscribeAction, mockCallback);
    expect(res1).toBeFSAReply(readSubscribeAction);

    expect(board.digitalReaders[INPUT_PIN]).toBe(1);
    const res2 = digitalReadSubscribe(readSubscribeAction, mockCallback);
    expect(res2).toBeFSAReply(readSubscribeAction);
    expect(res2.meta.alreadySubscribed).toBeTruthy();

    expect(board.digitalReaders[INPUT_PIN]).toBe(1);
  });

  test('digital read should get a good reading when already subscribed', (done) => {
    const callback = (value: number) => {
      expect(value).toBe(board.HIGH);
      digitalRead(readAction).then((res) => {
        expect(res).toBeFSAReply(readAction);
        expect(res.payload.value).toBe(board.HIGH);
        const res2 = digitalReadUnsubscribe(readUnsubscribeAction, callback);
        expect(res2).toBeFSAReply(readUnsubscribeAction);
        done();
      });
    };

    expect(board.digitalReaders[INPUT_PIN]).toBe(0);
    expect(board.listenerCount(`digital-read-${INPUT_PIN}`)).toBe(0);
    const res1 = digitalReadSubscribe(readSubscribeAction, callback);
    expect(res1).toBeFSAReply(readSubscribeAction);
    expect(board.digitalReaders[INPUT_PIN]).toBe(1);
    expect(board.listenerCount(`digital-read-${INPUT_PIN}`)).toBe(1);
  });

  test('subscribe to bad pin', () => {
    const callback = jest.fn();
    const readSubscribeAction = digitalReadSubscribeActionBuilder(BAD_PIN);
    const res = digitalReadSubscribe(readSubscribeAction, callback);
    expect(callback).not.toHaveBeenCalled();
    expect(res).toBeFSAReply(readSubscribeAction);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('unsubscribe to bad pin', () => {
    const callback = jest.fn();
    const readUnsubscribeAction = digitalReadUnsubscribeActionBuilder(BAD_PIN);
    const res = digitalReadUnsubscribe(readUnsubscribeAction, callback);
    expect(callback).not.toHaveBeenCalled();
    expect(res).toBeFSAReply(readUnsubscribeAction);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });
});
