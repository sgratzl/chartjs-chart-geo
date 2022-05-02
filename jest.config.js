/* eslint-env node */

module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts-esm',
  rootDir: './src',
  testRegex: '((\\.|/)(test|spec))\\.tsx?$',
};
