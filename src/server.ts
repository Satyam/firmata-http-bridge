import express, { Express } from 'express';
import { createServer, Server } from 'http';
import path from 'path';
import { config as envRead } from 'dotenv';

// https://github.com/firmata/firmata.js/tree/master/packages/firmata.js
import Board from 'firmata';

import { FSA, Commands, ErrorCodes } from './types';
import * as pinCmds from './pinCommands';

const commands: Record<string, Commands> = {
  ...pinCmds,
};

envRead();
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

      app.post('/command', function (req, res) {
        const action = req.body as FSA;

        const { type } = action;

        if (type in commands) {
          res.json(commands[type](board, action));
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

      app.get('/', (req, res) => {
        res.sendFile('index.html', {
          root: path.resolve(__dirname, '../build'),
          dotfiles: 'deny',
        });
      });

      app.get('*', (req, res) => {
        res.sendFile(req.path, {
          root: path.resolve(__dirname, '../build'),
          dotfiles: 'deny',
        });
      });

      board = new Board(process.env.REACT_APP_USB_PORT);

      board.on('ready', () => {
        console.log('Arduino is ready to communicate');
        http.listen(process.env.REACT_APP_HTTP_PORT, () => {
          console.log(
            `Firmata bridge listening on port ${process.env.REACT_APP_HTTP_PORT}!`
          );
          resolve({ app, board, http });
        });
      });
    }
  );
}

export function stop() {
  console.log('Server closing');
  http.close();
  board.serialClose(board.SERIAL_PORT_IDs.DEFAULT);
}
