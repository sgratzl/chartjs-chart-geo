/* eslint-env node */
// const path = require('path');

module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts-esm',
  moduleNameMapper: {
    '^d3-(.*)$': `d3-$1\\dist\\d3-$1`,
  },
  rootDir: './src',
  testRegex: '((\\.|/)(test|spec))\\.m?tsx?$',
};
