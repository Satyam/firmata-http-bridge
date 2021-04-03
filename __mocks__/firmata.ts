// @ts-nocheck
import SerialPort from 'serialport';
import StreamSerialPort from '@serialport/stream';
import AbstractBinding from '@serialport/binding-abstract';
import Board from 'firmata';

class MockSerialPortBinding extends AbstractBinding {
  constructor(
    path: string,
    options: SerialPort.Options,
    callback: SerialPort.callback
  ) {
    super(path, options, (error) => {
      console.log('MockSerialPortBinding', error);
      callback(error);
    });
    this.sp = new StreamSerialPort(path, options, (error) => {
      console.log({ error });
    });
    console.log('constructor');
  }
}

SerialPort.Binding = MockSerialPortBinding;

const mock = jest.fn((port) => {
  // SerialPort.list().then(
  //   (ports) => ports.forEach(console.log),
  //   (err) => console.error(err)
  // );

  let readyCallback: () => void;
  let instantiated = false;

  const RealBoard = jest.requireActual('firmata');
  let realBoardInstance: Board;
  // try {
  //   const b = new RealBoard(port);
  //   console.log('returning');
  //   return b;
  // } catch {
  //   console.log('No board available at', port);
  // }

  realBoardInstance = new RealBoard(new SerialPort(port), (err) => {
    console.error('caught error', err);
  });
  instantiated = true;
  if (readyCallback) {
    setTimeout(readyCallback, 10);
  }
  const pins = [
    {
      supportedModes: [],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 3, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 3, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 3, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 3, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 3, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 3, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 127,
    },
    {
      supportedModes: [0, 1, 2, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 0,
    },
    {
      supportedModes: [0, 1, 2, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 1,
    },
    {
      supportedModes: [0, 1, 2, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 2,
    },
    {
      supportedModes: [0, 1, 2, 4, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 3,
    },
    {
      supportedModes: [0, 1, 2, 4, 6, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 4,
    },
    {
      supportedModes: [0, 1, 2, 4, 6, 11],
      mode: undefined,
      value: 0,
      report: 1,
      analogChannel: 5,
    },
  ];
  return {
    ...realBoardInstance,
    on: jest.fn((eventName, cb) => {
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
    }),
    pinMode: jest.fn((pin: number, mode: number) => {
      pins[pin].mode = mode;
    }),
    digitalWrite: jest.fn((pin: number, output: number) => {
      pins[pin].value = output;
    }),
    digitalRead: jest.fn((pin: number, cb) => {
      cb(1);
    }),
    reportDigitalPin: jest.fn((pin: number, mode: number) => {
      pins[pin].report = mode;
    }),
    reset: jest.fn(),
    transport: {
      isOpen: false,
    },
    isReady: true,
    pins,
  };
});

export default mock;
