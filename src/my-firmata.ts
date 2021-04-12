import Firmata from 'firmata';
import type SerialPort from 'serialport';

const drRegex = /^digital-read-(\d+)$/;
const arRegex = /^analog-read-(\d+)$/;

export default class Board extends Firmata {
  digitalReaders: number[];
  analogReaders: number[];

  constructor(
    serialPort: any,
    optionsOrCallback?: Firmata.Options | ((error: any) => void),
    callback?: (error: any) => void
  ) {
    super(serialPort, optionsOrCallback, callback);
    this.once('ready', this.initReaders);
  }

  initReaders(): void {
    const numPins = this.pins.length;
    this.digitalReaders = Array(numPins).fill(0);
    this.analogReaders = Array(numPins).fill(0);

    this.on('newListener', (eventName: string) => {
      const matchDr = drRegex.exec(eventName);
      if (matchDr) {
        const pin = parseInt(matchDr[1], 10);
        // This off and on reporting is because it gets a fresh reading
        // for each new subscriber.  Otherwise, the second subscriber won't
        // get any reading until there is a change. This forces an
        // initial reading on each subscription.
        if (this.digitalReaders[pin] > 0) {
          this.reportDigitalPin(pin, 0);
        }
        this.reportDigitalPin(pin, 1);
        this.digitalReaders[pin] += 1;
      }
      const matchAr = arRegex.exec(eventName);
      if (matchAr) {
        const pin = parseInt(matchDr[1], 10);
        if (this.analogReaders[pin] > 0) {
          this.reportAnalogPin(pin, 0);
        }
        this.reportAnalogPin(pin, 1);
        this.analogReaders[pin] += 1;
      }
    });

    this.on('removeListener', (eventName: string) => {
      const matchDr = drRegex.exec(eventName);
      if (matchDr) {
        const pin = parseInt(matchDr[1], 10);
        this.digitalReaders[pin] -= 1;
        if (this.digitalReaders[pin] === 0) {
          this.reportDigitalPin(pin, 0);
        }
      }
      const matchAr = arRegex.exec(eventName);
      if (matchAr) {
        const pin = parseInt(matchDr[1], 10);
        this.analogReaders[pin] -= 1;
        if (this.analogReaders[pin] === 0) {
          this.reportAnalogPin(pin, 0);
        }
      }
    });
  }

  resetWithCallback(cb: (error?: SerialPort.callback) => void) {
    super.reset();
    if (this.digitalReaders) {
      this.digitalReaders.forEach((count: number, pin: number) => {
        if (count) {
          this.removeAllListeners(`digital-read-${pin}`);
        }
      });
    }
    if (this.analogReaders) {
      this.analogReaders.forEach((count: number, pin: number) => {
        if (count) {
          this.removeAllListeners(`analog-read-${pin}`);
        }
      });
    }
    const t = this.transport;
    if (t?.isOpen) {
      t.drain((error) => {
        if (error) {
          cb(error);
        } else {
          t.flush(cb);
        }
      });
    } else {
      cb();
    }
  }

  reset() {
    this.resetWithCallback((error) => {
      if (error) console.error(error);
    });
  }

  close(cb: (error?: SerialPort.callback) => void) {
    this.resetWithCallback((error) => {
      if (error) cb(error);
      else {
        const t = this.transport;
        if (t?.isOpen) {
          t.close(cb);
        } else {
          cb();
        }
      }
    });
  }
}
