// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default [{
  output: {
    file: 'build/Chart.Graphs.js',
    name: 'ChartGraphs',
    format: 'umd',
    globals: {
      'chart.js': 'Chart'
    }
  },
  external: ['chart.js'],
  plugins: [
    resolve(),
    commonjs(),
    babel()
  ]
}, {
  output: {
    file: 'build/Chart.Graphs.esm.js',
    name: 'ChartGraphs',
    format: 'esm',
    globals: {
      'chart.js': 'Chart'
    }
  },
  external: ['chart.js'],
  plugins: [
    resolve(),
    commonjs(),
    babel()
  ]
}];
