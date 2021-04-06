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
  makeReply,
} from './actionBuilders.js';
import { ErrorCodes } from './types.js';

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
  if (board?.transport?.isOpen)
    // @ts-ignore
    board.transport.close(done);
  else done();
});

describe('pinMode', () => {
  test('toBeFSAReply', () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.MODES.OUTPUT
    );

    expect(makeReply(modeAction)).toBeFSAReply(modeAction);
    expect(modeAction).not.toBeFSAReply(modeAction);
  });

  test('valid mode', () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.MODES.OUTPUT
    );

    expect(board.pins[config.TEST_DIGITAL_OUTPUT_PIN].mode).toBeUndefined();
    expect(pinMode(modeAction)).toBeFSAReply(modeAction);
    expect(board.pins[config.TEST_DIGITAL_OUTPUT_PIN].mode).toBe(
      board.MODES.OUTPUT
    );
  });

  test('invalid pin', () => {
    const modeAction = pinModeActionBuilder(BAD_PIN, board.MODES.OUTPUT);

    const response = pinMode(modeAction);
    expect(response).toBeFSAReply(modeAction);
    expect(response).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('invalid mode', () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      BAD_MODE
    );
    const response = pinMode(modeAction);
    expect(response).toBeFSAReply(modeAction);
    expect(response).toHaveErrorCode(ErrorCodes.BAD_MODE);
  });
});

describe('digitalWrite', () => {
  test('pin high', () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.MODES.OUTPUT
    );
    pinMode(modeAction);

    const writeHigh = digitalWriteActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.HIGH
    );
    expect(board.pins[config.TEST_DIGITAL_OUTPUT_PIN].value).toEqual(board.LOW);
    expect(digitalWrite(writeHigh)).toBeFSAReply(writeHigh);
    expect(board.pins[config.TEST_DIGITAL_OUTPUT_PIN].value).toEqual(
      board.HIGH
    );
  });

  test('pin low', () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.MODES.OUTPUT
    );
    pinMode(modeAction);

    const writeLow = digitalWriteActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.LOW
    );
    expect(board.pins[config.TEST_DIGITAL_OUTPUT_PIN].value).toEqual(
      board.HIGH
    );
    expect(digitalWrite(writeLow)).toBeFSAReply(writeLow);
    expect(board.pins[config.TEST_DIGITAL_OUTPUT_PIN].value).toEqual(board.LOW);
  });

  test('bad pin', () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.MODES.OUTPUT
    );
    pinMode(modeAction);

    const writeHigh = digitalWriteActionBuilder(BAD_PIN, board.HIGH);
    const result = digitalWrite(writeHigh);
    expect(result).toBeFSAReply(writeHigh);
    expect(result).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });

  test('bad value', () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      board.MODES.OUTPUT
    );
    pinMode(modeAction);

    const writeHigh = digitalWriteActionBuilder(
      config.TEST_DIGITAL_OUTPUT_PIN,
      BAD_MODE
    );
    const result = digitalWrite(writeHigh);
    expect(result).toBeFSAReply(writeHigh);
    expect(result).toHaveErrorCode(ErrorCodes.BAD_OUTPUT);
  });
});
describe('digitalRead', () => {
  test(`read pin ${config.TEST_DIGITAL_INPUT_PIN} with pullup`, async () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_INPUT_PIN,
      board.MODES.PULLUP
    );
    pinMode(modeAction);

    const readAction = digitalReadActionBuilder(config.TEST_DIGITAL_INPUT_PIN);
    const res = await digitalRead(readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res.payload.value).toBe(board.HIGH);
  });

  test('bad pin', async () => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_INPUT_PIN,
      board.MODES.PULLUP
    );
    pinMode(modeAction);

    const readAction = digitalReadActionBuilder(BAD_PIN);
    const res = await digitalRead(readAction);
    expect(res).toBeFSAReply(readAction);
    expect(res).toHaveErrorCode(ErrorCodes.BAD_PIN);
  });
});
describe('digitalReadSubscription', () => {
  beforeAll(() => {
    const modeAction = pinModeActionBuilder(
      config.TEST_DIGITAL_INPUT_PIN,
      board.MODES.PULLUP
    );
    pinMode(modeAction);
  });

  test(`Subscribe to read pin ${config.TEST_DIGITAL_INPUT_PIN} with pullup`, (done) => {
    const readSubscribeAction = digitalReadSubscribeActionBuilder(
      config.TEST_DIGITAL_INPUT_PIN
    );
    const readUnsubscribeAction = digitalReadUnsubscribeActionBuilder(
      config.TEST_DIGITAL_INPUT_PIN
    );

    const res1 = digitalReadSubscribe(readSubscribeAction, (value) => {
      expect(value).toBe(board.HIGH);
      const res2 = digitalReadUnsubscribe(readUnsubscribeAction);
      expect(res2).toBeFSAReply(readUnsubscribeAction);
      done();
    });
    expect(res1).toBeFSAReply(readSubscribeAction);
  });
  test(`Subscribe twice to read pin ${config.TEST_DIGITAL_INPUT_PIN} with pullup`, (done) => {
    const readSubscribeAction = digitalReadSubscribeActionBuilder(
      config.TEST_DIGITAL_INPUT_PIN
    );
    const readUnsubscribeAction = digitalReadUnsubscribeActionBuilder(
      config.TEST_DIGITAL_INPUT_PIN
    );

    console.log('before', board.pins[config.TEST_DIGITAL_INPUT_PIN]);
    const callback = jest.fn();
    const res1 = digitalReadSubscribe(readSubscribeAction, callback);
    expect(res1).toBeFSAReply(readSubscribeAction);

    console.log('middle', board.pins[config.TEST_DIGITAL_INPUT_PIN]);

    const res2 = digitalReadSubscribe(readSubscribeAction, (value) => {
      console.log('second cb', board.pins[config.TEST_DIGITAL_INPUT_PIN]);
      // expect(value).toBe(board.HIGH);
      const res = digitalReadUnsubscribe(readUnsubscribeAction);
      expect(res).toBeFSAReply(readUnsubscribeAction);
      console.log('second cb unsub', board.pins[config.TEST_DIGITAL_INPUT_PIN]);
      expect(callback).not.toBeCalled();
      done();
    });
    console.log('after', board.pins[config.TEST_DIGITAL_INPUT_PIN]);
    expect(res2).toBeFSAReply(readSubscribeAction);
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
