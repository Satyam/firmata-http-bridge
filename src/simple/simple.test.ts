import fetch from 'node-fetch';
import Board from 'firmata';

import { config, board } from '../config.js';
import { start, stop } from '../server.js';

const buildUrl = (...path: (string | number)[]): string =>
  `http://localhost:${config.HTTP_PORT}/${path.join('/')}`;

const LED_BUILTIN = 13;
const INPUT_PIN = 2;

const BAD_PIN = 999;
const BAD_MODE = 999;

beforeAll(() =>
  start().catch(() => {
    // If it fails here it probably means the board is not connected or powered
    process.exit(1);
  })
);

afterAll(stop);
describe('Simple URL GET requests', () => {
  describe('Various basic status calls', () => {
    test('Version', async () => {
      const res = await fetch(buildUrl('version'));
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`
        "<h3>Firmware version</h3><pre>{
          \\"name\\": \\"StandardFirmata.ino\\",
          \\"version\\": {
            \\"major\\": 2,
            \\"minor\\": 5
          }
        }</pre>"
      `);
    });
    test('Analog Pins', async () => {
      const res = await fetch(buildUrl('analogPins'));
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`
        "<h3>Analog pins</h3><pre>[
          14,
          15,
          16,
          17,
          18,
          19
        ]</pre>"
      `);
    });
    test('Digital Pins', async () => {
      const res = await fetch(buildUrl('digitalPins'));
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(
        `"There are 20 pins in this board"`
      );
    });
    test('Single Digital Pin', async () => {
      const res = await fetch(buildUrl('digitalPins', 1));
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`
        "<h3>Pin 1</h3><pre>{
          \\"supportedModes\\": [],
          \\"value\\": 0,
          \\"report\\": 1,
          \\"analogChannel\\": 127
        }</pre>"
      `);
    });
    test('Single Digital Pin with bad pin', async () => {
      const res = await fetch(buildUrl('digitalPins', BAD_PIN));
      expect(res.status).toBe(400);
      expect(await res.text()).toMatchInlineSnapshot(`"Invalid Pin 999"`);
    });
  });
  describe('pin mode', () => {
    test('pin mode', async () => {
      const res = await fetch(
        buildUrl('pinMode', LED_BUILTIN, board.MODES.OUTPUT)
      );
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`"Pin 13 set to mode 1"`);
    });

    test('bad pin', async () => {
      const res = await fetch(buildUrl('pinMode', BAD_PIN, board.MODES.OUTPUT));
      expect(res.status).toBe(400);
      expect(await res.text()).toMatchInlineSnapshot(`"Invalid Pin 999"`);
    });

    test('bad mode', async () => {
      const res = await fetch(buildUrl('pinMode', LED_BUILTIN, BAD_MODE));
      expect(res.status).toBe(400);
      expect(await res.text()).toMatchInlineSnapshot(
        `"Invalid mode 999 for pin 13"`
      );
    });
  });

  describe('digitalWrite', () => {
    beforeAll(async () => {
      const res1 = await fetch(
        buildUrl('pinMode', LED_BUILTIN, board.MODES.OUTPUT)
      );
      expect(res1.status).toBe(200);
    });
    test('pin high', async () => {
      const res = await fetch(
        buildUrl('digitalWrite', LED_BUILTIN, board.HIGH)
      );
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`"Pin 13 set to 1"`);
    });

    test('pin low', async () => {
      const res = await fetch(buildUrl('digitalWrite', LED_BUILTIN, board.LOW));
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`"Pin 13 set to 0"`);
    });

    test('bad pin', async () => {
      const res = await fetch(
        buildUrl('digitalWrite', BAD_PIN, board.MODES.OUTPUT)
      );
      expect(res.status).toBe(400);
      expect(await res.text()).toMatchInlineSnapshot(`"Invalid Pin 999"`);
    });

    test('bad value', async () => {
      const res = await fetch(buildUrl('digitalWrite', LED_BUILTIN, 999));
      expect(res.status).toBe(400);
      expect(await res.text()).toMatchInlineSnapshot(
        `"Invalid output 999 for pin 13"`
      );
    });
  });
  describe('digitalRead', () => {
    beforeAll(async () => {
      const res = await fetch(
        buildUrl('pinMode', INPUT_PIN, board.MODES.PULLUP)
      );
      expect(res.status).toBe(200);
    });

    test('read pin 2 with pullup', async () => {
      const res = await fetch(buildUrl('digitalRead', INPUT_PIN));
      expect(res.status).toBe(200);
      expect(await res.text()).toMatchInlineSnapshot(`"Pin 2 returned 1"`);
    });
    test('bad pin', async () => {
      const res = await fetch(buildUrl('digitalRead', BAD_PIN));
      expect(res.status).toBe(400);
      expect(await res.text()).toMatchInlineSnapshot(`"Invalid Pin 999"`);
    });
  });
});
