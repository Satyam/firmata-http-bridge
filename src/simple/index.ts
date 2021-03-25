/**
 * Setup to accept commands via plain HTTP GET messages,
 * dispatch them, and send back their replies
 * @module
 */
import { validDigitalPin, validMode, validOutput } from '../utils.js';
import { app, board } from '../config.js';

/**
 * Returns the HTML code for a nicely formatted object
 * with a message
 * @param msg the message to set as an `<h3>` heading
 * @param value the object to be formatted in a `<pre>`.
 * @returns
 */
function jsonPre(msg: string, value: object): string {
  return `<h3>${msg}</h3><pre>${JSON.stringify(value, null, 2)}</pre>`;
}

/**
 * Sets the express server to respond to the following HTTP GET commands,
 * executes them and replies in regular text or HTML messages.
 *
 * * `/version`
 * * `/analogPins`
 * * `/digitalPins/:pin?`
 * * `/pinMode/:pin/:mode`
 * * `/digitalWrite/:pin/:output`
 * * `/digitalRead/:pin`
 *
 * @export
 */
export default function setup(): void {
  app.get('/version', (req, res) => {
    res.send(jsonPre('Firmware version', board.firmware));
  });

  app.get('/analogPins', (req, res) => {
    res.send(jsonPre('Analog pins', board.analogPins));
  });

  app.get('/digitalPins/:pin?', (req, res) => {
    const pins = board.pins;
    const pin = parseInt(req.params.pin, 10);

    if (pin) {
      if (!validDigitalPin(board, pin)) {
        res.status(400).send(`Invalid Pin ${pin}`);
        return;
      }
      res.send(jsonPre(`Pin ${pin}`, pins[pin]));
    } else {
      res.send(`There are ${pins.length} pins in this board`);
    }
  });

  app.get('/pinMode/:pin/:mode', function (req, res) {
    const pin = parseInt(req.params.pin, 10);
    const mode = parseInt(req.params.mode, 10);

    if (!validDigitalPin(board, pin)) {
      res.status(400).send(`Invalid Pin ${pin}`);
      return;
    }
    if (!validMode(board, pin, mode)) {
      res.status(400).send(`Invalid mode ${mode} for pin ${pin}`);
      return;
    }

    board.pinMode(pin, mode);

    res.send(`Pin ${pin} set to ${mode} mode`);
  });

  app.get('/digitalWrite/:pin/:output', function (req, res) {
    const pin = parseInt(req.params.pin, 10);
    const output = parseInt(req.params.output, 10);

    if (!validDigitalPin(board, pin)) {
      res.status(400).send(`Invalid Pin ${pin}`);
      return;
    }
    if (!validOutput(board, pin, output)) {
      res.status(400).send(`Invalid output ${output} for pin ${pin}`);
      return;
    }

    board.digitalWrite(pin, output);

    res.send(`Pin ${pin} set to ${output}`);
  });

  function digitalRead(pin: number): Promise<number> {
    return new Promise<number>((resolve) => {
      board.digitalRead(pin, function (value) {
        board.reportDigitalPin(pin, 0);
        resolve(value);
      });
    });
  }
  app.get('/digitalRead/:pin', function (req, res) {
    const pin = parseInt(req.params.pin, 10);

    if (!validDigitalPin(board, pin)) {
      res.status(400).send(`Invalid Pin ${pin}`);
      return;
    }

    digitalRead(pin).then(function (value) {
      res.send(`Pin ${pin} returned ${value}`);
    });
  });
}
