/* eslint-env node */
const path = require('path');

const mapper = {};
for (const d of ['d3-array', 'd3-geo', 'd3-scale-chromatic', 'd3-interpolate', 'd3-color']) {
  mapper[`^${d}$`] = require.resolve(d).replace(`src${path.sep}index.js`, `dist${path.sep}/${d}.js`);
}

module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts-esm',
  moduleNameMapper: mapper,
  testRegex: '((\\.|/)(test|spec))\\.m?tsx?$',
};
