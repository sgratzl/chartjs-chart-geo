import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import { terser } from '@chiogen/rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

function resolveYear() {
  // Extract copyrights from the LICENSE.
  const license = fs.readFileSync('./LICENSE', 'utf-8').toString();
  const matches = Array.from(license.matchAll(/\(c\) (\d+-\d+)/gm));
  if (!matches || matches.length === 0) {
    return 2021;
  }
  return matches[matches.length - 1][1];
}
const year = resolveYear();

const banner = `/**
 * ${pkg.name}
 * ${pkg.homepage}
 *
 * Copyright (c) ${year} ${pkg.author.name} <${pkg.author.email}>
 */
`;

/**
 * defines which formats (umd, esm, cjs, types) should be built when watching
 */
const watchOnly = ['umd'];

const isDependency = (v) => Object.keys(pkg.dependencies || {}).some((e) => e === v || v.startsWith(`${e}/`));
const isPeerDependency = (v) => Object.keys(pkg.peerDependencies || {}).some((e) => e === v || v.startsWith(`${e}/`));

export default function Config(options) {
  const buildFormat = (format) => {
    return !options.watch || watchOnly.includes(format);
  };
  const commonOutput = {
    sourcemap: true,
    banner,
    globals: {
      'chart.js': 'Chart',
      'chart.js/helpers': 'Chart.helpers',
    },
  };

  const base = {
    input: './src/index.ts',
    external: (v) => isDependency(v) || isPeerDependency(v),
    plugins: [
      typescript(),
      resolve({
        mainFields: ['module', 'main'],
        extensions: ['.mjs', '.cjs', '.js', '.jsx', '.json', '.node'],
        modulesOnly: true,
      }),
      commonjs(),
      replace({
        preventAssignment: true,
        values: {
          // eslint-disable-next-line no-undef
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || 'production',
          __VERSION__: JSON.stringify(pkg.version),
        },
      }),
      cleanup({
        comments: ['some', 'ts', 'ts3s'],
        extensions: ['ts', 'tsx', 'js', 'jsx'],
        include: './src/**/*',
      }),
    ],
  };
  return [
    buildFormat('esm') && {
      ...base,
      output: {
        ...commonOutput,
        file: pkg.module,
        format: 'esm',
      },
    },
    buildFormat('cjs') && {
      ...base,
      output: {
        ...commonOutput,
        file: pkg.require,
        format: 'cjs',
      },
      external: (v) => (isDependency(v) || isPeerDependency(v)) && ['d3-'].every((di) => !v.includes(di)),
    },
    (buildFormat('umd') || buildFormat('umd-min')) && {
      ...base,
      input: './src/index.umd.ts',
      output: [
        buildFormat('umd') && {
          ...commonOutput,
          file: pkg.umd,
          format: 'umd',
          name: pkg.global,
        },
        buildFormat('umd-min') && {
          ...commonOutput,
          file: pkg.unpkg,
          format: 'umd',
          name: pkg.global,
          plugins: [terser()],
        },
      ].filter(Boolean),
      external: (v) => isPeerDependency(v),
    },
    buildFormat('types') && {
      ...base,
      output: {
        ...commonOutput,
        file: pkg.types,
        format: 'es',
      },
      plugins: [
        dts({
          respectExternal: true,
          compilerOptions: {
            skipLibCheck: true,
            skipDefaultLibCheck: true,
          },
        }),
      ],
    },
  ].filter(Boolean);
}
