import express, { Express } from 'express';
import { createServer, Server } from 'http';
import path from 'path';

// https://github.com/firmata/firmata.js/tree/master/packages/firmata.js
import Board from 'firmata';

import config from './config.js';

import setupSimple from './simple/index.js';
import setupPost from './post/index.js';
import setupSockets from './sockets/index.js';

// @ts-ignore
import * as dn from './expose__dirname.cjs';

export type SetupType = {
  app: Express;
  http: Server;
  board: Board;
};

let http: Server;
let board: Board;

function pathResolve(relPath: string): string {
  // const dirname = __dirname || dn.__dirname;
  return path.resolve(dn.__dirname, relPath);
}
/**
 * Starts the server by
 * * Opening the board specified in the
 *   `USB_PORT` command line option or environment variable.
 * * Launching a web server listening on the port specified in the
 *   `HTTP_PORT` command line option or environment variable.
 * @export
 * @return {Promise} A promise returning nothing
 */
export function start(): Promise<SetupType> {
  return new Promise<SetupType>((resolve, reject) => {
    // initialize global variables
    const app = express();
    http = createServer(app);
    board = new Board(config.USB_PORT);

    board.on('error', reject);

    app.use(express.json());

    setupSimple({ app, http, board });
    setupPost({ app, http, board });
    setupSockets({ app, http, board });

    app.get('/dist/*', (req, res) => {
      res.sendFile(req.path.replace(/\/dist\//, '/'), {
        root: pathResolve('../dist'),
        dotfiles: 'deny',
      });
    });

    app.get('/', (req, res) => {
      res.sendFile('index.html', {
        root: pathResolve('../public'),
        dotfiles: 'deny',
      });
    });

    app.get('*', (req, res) => {
      res.sendFile(req.path, {
        root: pathResolve('../public'),
        dotfiles: 'deny',
      });
    });

    board.on('ready', () => {
      console.log(`Arduino at ${config.USB_PORT} is ready to communicate`);
      http.listen(config.HTTP_PORT, () => {
        console.log(`Firmata bridge listening on port ${config.HTTP_PORT}!`);
        resolve({ app, http, board });
      });
    });
  });
}
/**
 * Stops the server and closes the communication with the board
 *
 * @export
 * @return {Promise} An empty Promise when both are closed.
 */
export function stop(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    console.log('Server closing');
    http.close();
    if (board) {
      // @ts-ignore
      board.transport.close((error) => {
        /* istanbul ignore if */
        if (error) reject(error);
        else resolve();
      });
    } else resolve();
  });
}
