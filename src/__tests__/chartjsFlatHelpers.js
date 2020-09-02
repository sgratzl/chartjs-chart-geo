/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chartjs = require('chart.js');

// helper that reexports in an commonjs way all the helpers for Jest
module.exports = Object.assign({}, chartjs.helpers, chartjs.helpers.canvas, chartjs.helpers.collection);
