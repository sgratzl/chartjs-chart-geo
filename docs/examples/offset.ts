import type { ChartConfiguration } from 'chart.js';
import { data } from './albers';

// #region config
export const offset: ChartConfiguration<'choropleth'> = {
  type: 'choropleth',
  data,
  options: {
    scales: {
      projection: {
        axis: 'x',
        projection: 'albersUsa',
        // offset in pixel
        projectionOffset: [50, 0],
      },
    },
  },
};
// #endregion config

// #region scale
export const scale: ChartConfiguration<'choropleth'> = {
  type: 'choropleth',
  data,
  options: {
    scales: {
      projection: {
        axis: 'x',
        projection: 'albersUsa',
        // custom scale factor,
        projectionScale: 1.5,
      },
    },
  },
};
// #endregion scale
