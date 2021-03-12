import express from 'express';
import { createServer } from 'http';
import { resolve } from 'path';
import { config as envRead } from 'dotenv';

// https://github.com/firmata/firmata.js/tree/master/packages/firmata.js
import Board from 'firmata';

import { FSA, Commands, ErrorCodes } from './types';
import * as pinCmds from './pinCommands';

const commands: Record<string, Commands> = {
  ...pinCmds,
};

envRead();

const app = express();
const http = createServer(app);

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
    root: resolve(__dirname, '../build'),
    dotfiles: 'deny',
  });
});

app.get('*', (req, res) => {
  res.sendFile(req.path, {
    root: resolve(__dirname, '../build'),
    dotfiles: 'deny',
  });
});

const board = new Board(process.env.REACT_APP_USB_PORT);

board.on('ready', () => {
  console.log('Arduino is ready to communicate');
  http.listen(process.env.REACT_APP_HTTP_PORT, () =>
    console.log(
      `Example app listening on port ${process.env.REACT_APP_HTTP_PORT}!`
    )
  );
});
