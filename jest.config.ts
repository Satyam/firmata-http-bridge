/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
  preset: 'ts-jest',
  coverageDirectory: 'coverage',

  coverageProvider: 'v8',

  coverageReporters: ['html', 'text', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/src/jest-setup.util.ts'],

  testEnvironment: 'node',

  transform: { '^.+\\.(ts|tsx|js|jsx)?$': 'ts-jest' },
  resolver: 'jest-ts-webcompat-resolver',
};
