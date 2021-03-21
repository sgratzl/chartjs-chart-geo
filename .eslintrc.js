/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('./package.json');

module.exports = {
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'airbnb-typescript',
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  settings: {
    react: {
      version: pkg.devDependencies.react ? 'detect' : '99.99.99',
    },
  },
  rules: {
    // '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off',
    'max-classes-per-file': 'off',
    'no-underscore-dangle': 'off',
  },
};
