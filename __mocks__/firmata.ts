// @ts-nocheck
import SerialPort from '@serialport/stream';
import AbstractBinding from '@serialport/binding-abstract';

let readyCallback: () => void;
let instantiated = false;

export const mockOn = jest.fn((eventName, cb) => {
  switch (eventName) {
    case 'ready':
      if (instantiated) setTimeout(cb, 10);
      else readyCallback = cb;
      return;
    case 'error':
      return;
    default:
      console.error(`got unexpected ${eventName}`);
      return;
  }
});

export const mockPinMode = jest.fn((pin, mode) => {
  console.log(`pinMode, pin: ${pin}, mode: ${mode}`);
});
export const mockDigitalWrite = jest.fn((pin, output) => {
  console.log(`digitalWrite, pin: ${pin}, output: ${output}`);
});

export const mockDigitalRead = jest.fn((pin, cb) => {
  console.log(`digitalRead, pin: ${pin}`);
  cb(1);
});

export const mockReportDigitalPin = jest.fn((pin, mode) => {
  console.log(`reportDigitalPin, pin: ${pin}, mode: ${mode}`);
});

export const mockReset = jest.fn();

const mock = jest.fn((port) => {
  SerialPort.Binding = AbstractBinding;

  const RealBoard = jest.requireActual('firmata');
  let realBoardInstance;
  try {
    realBoardInstance = new RealBoard(new SerialPort(port));
  } catch (err) {
    console.error('caught error', err);
  }
  instantiated = true;
  if (readyCallback) {
    setTimeout(readyCallback, 10);
  }
  return {
    ...realBoardInstance,
    on: mockOn,
    pinMode: mockPinMode,
    digitalWrite: mockDigitalWrite,
    digitalRead: mockDigitalRead,
    reportDigitalPin: mockReportDigitalPin,
    reset: mockReset,
    transport: {
      isOpen: false,
    },
    isReady: true,
  };
});

export default mock;
