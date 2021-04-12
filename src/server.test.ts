import fetch from 'node-fetch';

import config from './config.js';
import { start, stop } from './server.js';

import { FSA } from './types.js';

const BAD_PIN = 999;
const BAD_MODE = 999;

beforeAll(() =>
  start().catch((error) => {
    // If it fails here it probably means the board is not connected or powered
    process.stdout.write('', () =>
      process.stderr.write(`Server start: ${error}`, () => process.exit(1))
    );
  })
);

afterAll(stop);

const buildUrl = (path: string): string =>
  `http://localhost:${config.HTTP_PORT}/${path}`;

const postCommand: (action: FSA) => Promise<FSA> = (action) =>
  fetch(
    buildUrl('command'),

    {
      method: 'post',
      body: JSON.stringify(action),
      headers: { 'Content-Type': 'application/json' },
    }
  ).then((res) => res.json());

describe('server commands', () => {
  describe('various gets', () => {
    test('Default index.html from public', async () => {
      const res = await fetch(buildUrl(''));
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toMatch(/^text\/html/);
      expect(parseInt(res.headers.get('content-length'))).toBeGreaterThan(0);
    });
    test('Some content from public', async () => {
      const res = await fetch(buildUrl('something.txt'));
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`
        "Hello World!
        "
      `);
    });
    test('Non-existing content', async () => {
      const res = await fetch(buildUrl('nosuchfile.txt'));
      expect(res.status).toBe(404);
    });
    test('Some content from dist', async () => {
      const res = await fetch(buildUrl('dist/index.js'));
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toMatch(
        /^application\/javascript/
      );
      expect(parseInt(res.headers.get('content-length'))).toBeGreaterThan(0);
    });
    test('Non-existing content', async () => {
      const res = await fetch(buildUrl('dist/nosuchfile.txt'));
      expect(res.status).toBe(404);
    });
  });
});
