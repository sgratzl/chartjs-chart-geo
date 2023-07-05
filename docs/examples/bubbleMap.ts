import type { ChartConfiguration } from 'chart.js';
import { Feature, topojson } from '../../src';
// #region data
import states10m from 'us-atlas/states-10m.json';
import capitals from './data/us-capitals.json';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const states: Feature = topojson.feature(states10m as any, states10m.objects.states as any).features;

export const data: ChartConfiguration<'bubbleMap'>['data'] = {
  labels: capitals.map((d) => d.description),
  datasets: [
    {
      outline: states,
      showOutline: true,
      backgroundColor: 'steelblue',
      data: capitals.map((d) => Object.assign(d, { value: Math.round(Math.random() * 10) })),
    },
  ],
};
// #endregion data
// #region config
export const config: ChartConfiguration<'bubbleMap'> = {
  type: 'bubbleMap',
  data,
  options: {
    plugins: {
      datalabels: {
        align: 'top',
        formatter: (v) => {
          return v.description;
        },
      },
    },
    scales: {
      projection: {
        axis: 'x',
        projection: 'albersUsa',
      },
      size: {
        axis: 'x',
        size: [1, 20],
      },
    },
    layout: {
      // padding: 20
    },
  },
  plugins: [ChartDataLabels],
};
// #endregion config
