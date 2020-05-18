// rollup.config.js
import pnp from 'rollup-plugin-pnp-resolve';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

export default [
  {
    input: 'src/bundle.js',
    output: {
      file: pkg.main,
      name: 'ChartGeo',
      format: 'umd',
      globals: {
        'chart.js': 'Chart',
      },
    },
    external: Object.keys(pkg.peerDependencies),
    plugins: [commonjs(), pnp(), resolve(), babel({ babelHelpers: 'runtime' })],
  },
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'esm',
    },
    external: Object.keys(pkg.peerDependencies).concat(Object.keys(pkg.dependencies)),
    plugins: [commonjs(), pnp(), resolve()],
  },
];
