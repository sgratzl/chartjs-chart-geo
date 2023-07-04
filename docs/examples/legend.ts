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
        projection: 'albersUsa',
      },
      color: {
        axis: 'x',
        quantize: 5,
        legend: {
          position: 'bottom-right',
          align: 'right',
        },
      },
    },
  },
};
// #endregion config
