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

  reset() {
    super.reset();
    const t = this.transport;
    if (t?.isOpen) {
      t.drain((error) => {
        if (error) {
          console.error('in board.reset() drain', error);
        } else {
          t.flush((error) => {
            if (error) {
              console.error('in board.reset() flush', error);
            }
          });
        }
      });
    }
    this.digitalReaders.forEach((count: number, pin: number) => {
      if (count) {
        this.removeAllListeners(`digital-read-${pin}`);
      }
    });
    this.analogReaders.forEach((count: number, pin: number) => {
      if (count) {
        this.removeAllListeners(`analog-read-${pin}`);
      }
    });
  }

  close(cb: (error?: SerialPort.callback) => void) {
    this.reset();
    const t = this.transport;
    if (t?.isOpen) {
      t.drain((error) => {
        if (error) cb(error);
        else t.close(cb);
      });
    } else cb();
  }
}
