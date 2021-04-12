/**
 * My version of the Firmata software mostly to leverage the native NodeJS
 * [`EventEmitter`](https://nodejs.org/docs/latest/api/events.html#events_class_eventemitter) module.
 *
 * The current [`digitalRead`](../classes/my_firmata.default.html#digitalread) and [`analogRead`](../classes/my_firmata.default.html#analogread) methods actually
 * create subscriptions via EventEmitter to the `digital-read-??` and `analog-read-??` where `??`
 * is the pin number meant to be listened to.  The actual subscription is hidden behind these two methods,
 * with no further provisions to allow other features provided by `EventEmitter`.
 *
 * This override also offers a [`close`](../classes/my_firmata.default.html#close) method to close the communication with the board.
 * Admitedly, this method is usually pointless in an actual application, since the connection
 * would be naturally dropped when the application exists but it is needed for testing
 * purposes so that a battery of tests can be run opening and closing the connection as needed.
 *
 * The [`resetWithCallback`](../classes/my_firmata.default.html#resetwithcallback) allows for a `callback` argument which [`reset`](#reset)
 * doesn't have.  The original `reset` simply sends a `reset` message to the board, it does nothing
 * to reset other stuff on the `Board` instance.  In particular, this version drains and flushes
 * the communication channel to the board, to ensure there is nothing left pending.  This last operation
 * is asynchronous and thus needs a callback.
 *
 * It overrides the following methods:
 *
 * * [`constructor`](../classes/my_firmata.default.html#constructor)
 * * [`reset`](../classes/my_firmata.default.html#reset)
 *
 * and adds the following:
 *
 *  * [`initReaders`](../classes/my_firmata.default.html#initreaders)
 *  * [`resetWithCallback`](../classes/my_firmata.default.html#resetwithcallback)
 *  * [`close`](../classes/my_firmata.default.html#close)
 *
 * See the descriptions for each of the individual methods for further details.
 * @module
 */
import Firmata from 'firmata';
import type SerialPort from 'serialport';

const drRegex = /^digital-read-(\d+)$/;
const arRegex = /^analog-read-(\d+)$/;

export default class Board extends Firmata {
  digitalReaders: number[];
  analogReaders: number[];

  /**
   * Has the same signature as the original [constructor](https://github.com/firmata/firmata.js/tree/master/packages/firmata.js#firmata).
   *
   * It adds the [`initReaders`](#initreaders) method as a listener to the `ready` event
   * to set up additional features.
   * @constructor
   * @param serialPort
   * @param optionsOrCallback
   * @param callback
   */
  constructor(
    serialPort: any,
    optionsOrCallback?: Firmata.Options | ((error: any) => void),
    callback?: (error: any) => void
  ) {
    super(serialPort, optionsOrCallback, callback);
    this.once('ready', this.initReaders);
  }

  /**
   * Event listener for the `ready` event.
   *
   * It sets listeners for the [`newListener`](https://nodejs.org/docs/latest/api/events.html#events_event_newlistener)
   * and [`removeListener`](https://nodejs.org/docs/latest/api/events.html#events_event_removelistener)
   * events of [`EventEmitter`](https://nodejs.org/docs/latest/api/events.html#events_class_eventemitter)
   *
   * It is meant to detect subscriptions to the `digital-read-??` and `analog-read-??` events where `??`
   * is the pin number being listened to.  The purpose is to signal the board to start reporting
   * on new readings on those pins when there is at least one listener or cease when there is none.
   */
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
  /**
   * After calling the native `reset` method, it drops all subscriptions to
   * the digital and analog read events for all pins and drains the serial port
   * used to communicate with the board.  It also signals the serial port to flush
   * any data in ot.
   * @param cb Called when the serial port is flushed. It will receive an error
   * object if there was any problem with the serial port.
   */
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

  /**
   * Calls [`resetWithCallback`](#resetwithcallback) without waiting for a reply
   * from the serial port.  It is meant to preserve backward compatibility with the original method.
   *
   */
  reset() {
    this.resetWithCallback((error) => {
      if (error) console.error(error);
    });
  }

  /**
   * Calls [`resetWithCallback`](#resetwithcallback) and closes the serial port.
   *
   * @param {(error?: SerialPort.callback) => void} cb
   * @memberof Board
   */
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
