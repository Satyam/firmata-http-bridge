import express, { Express } from 'express';
import { createServer, Server } from 'http';
import path from 'path';

// https://github.com/firmata/firmata.js/tree/master/packages/firmata.js
import Board from 'firmata';

import { FSA, Commands, ErrorCodes } from './types';
import * as pinCmds from './pinCommands';
import config from './config';
import {
  digitalReadActionBuilder,
  digitalWriteActionBuilder,
  pinModeActionBuilder,
} from './actionBuilders';

const commands: Record<string, Commands> = {
  ...pinCmds,
};

let http: Server;
let board: Board;

export function start() {
  return new Promise<{ board: Board; http: Server; app: Express }>(
    (resolve) => {
      const app = express();
      http = createServer(app);

      app.use(express.json());

      app.get('/version', (req, res) => {
        res.json(board.firmware);
      });

      app.get('/AnalogPins', (req, res) => {
        res.json(board.analogPins);
      });

      app.get('/DigitalPins/:pin?', (req, res) => {
        const pins = board.pins;
        if (req.params.pin) {
          res.json(pins[parseInt(req.params.pin, 10)]);
        } else {
          res.json(pins.length);
        }
      });

      app.post('/command', async function (req, res) {
        const action = req.body as FSA;

        const { type } = action;

        if (type in commands) {
          res.json(await commands[type](board, action));
        } else {
          res.json({
            ...action,
            error: {
              code: ErrorCodes.BAD_ACTION_TYPE,
              msg: 'Invalid command',
            },
          });
        }
      });

      app.get('/pinMode/:pin/:mode', async function (req, res) {
        res.json(
          await commands.pinMode(
            board,
            pinModeActionBuilder(
              parseInt(req.params.pin, 10),
              parseInt(req.params.mode, 10)
            )
          )
        );
      });
      app.get('/digitalWrite/:pin/:output', async function (req, res) {
        res.json(
          await commands.digitalWrite(
            board,
            digitalWriteActionBuilder(
              parseInt(req.params.pin, 10),
              parseInt(req.params.output, 10)
            )
          )
        );
      });
      app.get('/digitalRead/:pin', async function (req, res) {
        res.json(
          await commands.digitalRead(
            board,
            digitalReadActionBuilder(parseInt(req.params.pin, 10))
          )
        );
      });

      app.get('/', (req, res) => {
        res.sendFile('index.html', {
          root: path.resolve(__dirname, '../public'),
          dotfiles: 'deny',
        });
      });

      app.get('*', (req, res) => {
        res.sendFile(req.path, {
          root: path.resolve(__dirname, '../public'),
          dotfiles: 'deny',
        });
      });

      board = new Board(config.USB_PORT);

      board.on('ready', () => {
        console.log(`Arduino at ${config.USB_PORT} is ready to communicate`);
        http.listen(config.HTTP_PORT, () => {
          console.log(`Firmata bridge listening on port ${config.HTTP_PORT}!`);
          resolve({ app, board, http });
        });
      });
    }
  );
}

export function stop() {
  return new Promise<void>((resolve, reject) => {
    console.log('Server closing');
    http.close();
    // @ts-ignore
    board.transport.close((error) => {
      /* istanbul ignore if */
      if (error) reject(error);
      else resolve();
    });
  });
}
