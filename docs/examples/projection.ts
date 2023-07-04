import type { ChartConfiguration } from 'chart.js';
import { data } from './albers';

// #region config
export const config: ChartConfiguration<'choropleth'> = {
  type: 'choropleth',
  data,
  options: {
    scales: {
      projection: {
        axis: 'x',
        projection: 'equalEarth',
      },
      color: {
        axis: 'x',
        interpolate: (v) => (v < 0.5 ? 'green' : 'red'),
        legend: {
          position: 'bottom-right',
          align: 'right',
        },
      },
    },
  },
};
// #endregion config
