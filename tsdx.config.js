const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('rollup-plugin-pnp-resolve');
const cleanup = require('rollup-plugin-cleanup');
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('./package.json'));

module.exports = {
  rollup(config, options) {
    if (options.format === 'umd') {
      config.input = './src/index.umd.ts';
    }

    config.output.globals['chart.js'] = 'Chart';
    config.output.globals['@sgratzl/chartjs-esm-facade'] = 'ChartESMFacade';

    if (options.format === 'umd') {
      const external = Object.keys(pkg.peerDependencies || {});
      config.external = (v) => external.includes(v);
    } else {
      const external = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}));
      config.external = (v) => external.includes(v);
    }

    const c = config.plugins.findIndex((d) => d.name === 'commonjs');
    if (c !== -1) {
      config.plugins.splice(c, 1);
    }
    config.plugins.splice(0, 0, resolve(), commonjs());
    config.plugins.push(
      cleanup({
        comments: ['some', 'ts', 'ts3s'],
        extensions: ['ts', 'tsx', 'js', 'jsx'],
        include: './src/**/*.*',
      })
    );
    config.output.banner = `/**
 * chartjs-chart-geo
 * https://github.com/sgratzl/chartjs-chart-geo
 *
 * Copyright (c) 2020 Samuel Gratzl <sam@sgratzl.com>
 */`;
    return config;
  },
};
