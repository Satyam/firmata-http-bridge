import { start, stop } from '../src/server';
import { config as envRead } from 'dotenv';
import fetch from 'node-fetch';
import { FSA } from '../src/types';
import Board from 'firmata';

const LED_BUILTIN = 13;

envRead();

let board: Board;

beforeAll(async () => {
  const props = await start();
  board = props.board;
});

afterAll(stop);

const postCommand: (action: FSA) => Promise<FSA> = (action) =>
  fetch(
    `http://localhost:${process.env.REACT_APP_HTTP_PORT}/command`,

    {
      method: 'post',
      body: JSON.stringify(action),
      headers: { 'Content-Type': 'application/json' },
    }
  ).then((res) => res.json());

describe('server commands', () => {
  test('pin mode', async () => {
    const action = {
      type: 'pinMode',
      payload: {
        pin: LED_BUILTIN,
        mode: board.MODES.OUTPUT,
      },
    };
    const res = await postCommand(action);
    expect(res).toStrictEqual(action);
  });
});
