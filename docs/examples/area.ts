import type { ChartConfiguration } from 'chart.js';
import { Feature, topojson } from '../../src';
import { data } from './bubbleMap';

// #region config
export const config: ChartConfiguration<'bubbleMap'> = {
  type: 'bubbleMap',
  data,
  options: {
    scales: {
      projection: {
        axis: 'x',
        projection: 'albersUsa',
      },
      size: {
        axis: 'x',
        size: [1, 20],
        mode: 'area',
      },
    },
    layout: {
      // padding: 20
    },
  },
};
// #endregion config
