import express from 'express';
import path from 'path';

import { config, board, app, http } from './config.js';

import setupSimple from './simple/index.js';
import setupPost from './post/index.js';
import setupSockets from './sockets/index.js';

// @ts-ignore
import * as dn from './expose__dirname.cjs';

function pathResolve(relPath: string): string {
  // const dirname = __dirname || dn.__dirname;
  return path.resolve(dn.__dirname, relPath);
}
/**
 * Starts the server by
 * * Opening the board specified in the
 *   `USB_PATH` command line option or environment variable.
 * * Launching a web server listening on the port specified in the
 *   `HTTP_PORT` command line option or environment variable.
 * @export
 * @return {Promise} A promise returning nothing
 */
export function start(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    app.use(express.json());

    setupSimple();
    setupPost();
    setupSockets();

    app.get('/dist/*', (req, res) => {
      res.sendFile(req.path, {
        root: pathResolve('../'),
        dotfiles: 'deny',
      });
    });

    app.get('/docs/*', (req, res) => {
      res.sendFile(req.path, {
        root: pathResolve('../'),
        dotfiles: 'deny',
      });
    });
    app.get('/coverage/*', (req, res) => {
      res.sendFile(req.path, {
        root: pathResolve('../'),
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

    board.on('error', (error) => {
      console.error('board error', error);
      setImmediate(() => reject(error));
    });
    board.once('ready', () => {
      console.log(`Arduino at ${config.USB_PATH} is ready to communicate`);
      http.listen(config.HTTP_PORT, () => {
        console.log(`Firmata bridge listening on port ${config.HTTP_PORT}!`);
        resolve();
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
    http.close((error) => {
      if (error) {
        console.error('Closing http', error);
        setImmediate(() => reject(error));
      } else
        board.close((error) => {
          /* istanbul ignore if */
          if (error) {
            console.error('Closing board', error);
            setImmediate(() => reject(error));
          } else resolve();
        });
    });
  });
}
