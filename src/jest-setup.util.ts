/// <reference types="jest" />
import { ErrorCodes, FSA } from './types.js';

declare global {
  namespace jest {
    // noinspection JSUnusedGlobalSymbols
    interface Matchers<R> {
      toBeFSAReply(expected: FSA): R;
      toHaveErrorCode(expected: ErrorCodes): R;
    }
  }
}

export default function setup(jestExpect: jest.Expect) {
  // Validates date as produced by Date.prototype.toISOString() method
  const toISOStringRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  if (typeof jestExpect !== 'undefined') {
    if ('toBeFSAReply' in jestExpect) return;
    if ('toHaveErrorCode' in jestExpect) return;

    jestExpect.extend({
      // Has to be declared as function to retain the value of `this`
      toBeFSAReply: function (received: FSA, expected: FSA) {
        const { type, meta, payload, error } = received;
        const { type: expectedType, payload: expectedPayload } = expected;
        const msg =
          this.utils.printExpected({
            ...expected,
            meta: { date: 'YYYY-MM-DDTHH:MM:SS.mmmZ' },
          }) +
          '\n\nreceived:\n' +
          this.utils.printReceived(received);

        let pass = true;
        pass =
          pass &&
          typeof meta === 'object' &&
          toISOStringRegex.test(meta.date) &&
          Object.keys(expectedPayload).every(
            (name) => expectedPayload[name] === payload[name]
          );
        if (type === `${expectedType}_reply`) {
        } else if (type === `${expectedType}_error`) {
          pass =
            pass &&
            typeof error === 'object' &&
            error.code in Object.keys(ErrorCodes) &&
            typeof error.msg === 'string';
        } else {
          pass = false;
        }

        return pass
          ? {
              message: () =>
                `expected(received).not.toBeFSAReply(expected)\n\nnot expected:\n ${msg}`,
              pass: true,
            }
          : {
              message: () =>
                `expected(received).toBeFSAReply(expected)\n\nexpected\n ${msg}`,
              pass: false,
            };
      },
      toHaveErrorCode: function (received: FSA, code: ErrorCodes) {
        return typeof received.error === 'object' &&
          Object.values(ErrorCodes).includes(received.error.code) &&
          typeof received.error.msg === 'string'
          ? {
              message: () =>
                `Received FSA ${received} has a valid error property`,
              pass: true,
            }
          : {
              message: () =>
                `Received FSA ${received} does not have a valid error property`,
              pass: false,
            };
      },
    });
  } else {
    console.error("Unable to find Jest's global expect.");
  }
}
