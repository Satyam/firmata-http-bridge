import express from 'express';
import { createServer } from 'http';
// https://github.com/firmata/firmata.js/tree/master/packages/firmata.js
import Board from 'firmata';
import { Server } from 'socket.io';

import config from './config.js';

export const app = express();
export const http = createServer(app);
export const board = new Board(config.USB_PORT);
