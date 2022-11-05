import path from 'path';

const mapper = {};
for (const d of ['d3-array', 'd3-geo', 'd3-scale-chromatic', 'd3-interpolate', 'd3-color']) {
  mapper[`^${d}$`] = `${d}${path.sep}dist${path.sep}${d}.js`;
}

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: mapper,
  testRegex: '((\\.|/)(test|spec))\\.tsx?$',
};
