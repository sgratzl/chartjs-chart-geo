/* eslint-env node */

module.exports = {
  preset: 'ts-jest',
  testRegex: '((\\.|/)(test|spec))\\.[jt]sx?$',
  moduleNameMapper: {
    'chart.js/helpers/.*': '<rootDir>/src/__tests__/chartjsFlatHelpers.js',
  },
};
