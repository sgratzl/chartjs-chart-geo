import type { ChartConfiguration } from 'chart.js';
import { Feature, topojson } from '../../src';

// #region data
import states10m from 'us-atlas/states-10m.json';
import capitals from './data/us-capitals.json';

const nation: Feature = topojson.feature(states10m as any, states10m.objects.nation as any).features[0];
const states: Feature = topojson.feature(states10m as any, states10m.objects.states as any).features;

const lookup = new Map(capitals.map(({ name, latitude, longitude }) => [name, { latitude, longitude }]));

export const data: ChartConfiguration<'choropleth'>['data'] = {
  labels: states.map((d) => d.properties.name),
  datasets: [
    {
      label: 'States',
      outline: nation,
      data: states.map((d) => ({
        feature: d,
        center: lookup.get(d.properties.name),
        value: Math.random() * 11,
      })),
    },
  ],
};
// #endregion data
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
