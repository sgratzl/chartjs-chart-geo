import type { ChartConfiguration } from 'chart.js';
import { Feature, topojson } from '../../src';

// #region data
import countries50m from 'world-atlas/countries-50m.json';

const countries: Feature = topojson.feature(countries50m as any, countries50m.objects.countries as any).features;

export const data: ChartConfiguration<'choropleth'>['data'] = {
  labels: countries.map((d) => d.properties.name),
  datasets: [
    {
      label: 'Countries',
      data: countries.map((d) => ({
        feature: d,
        value: Math.random(),
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
    showOutline: true,
    showGraticule: true,
    scales: {
      projection: {
        axis: 'x',
        projection: 'equalEarth',
      },
    },
    onClick: (evt, elems) => {
      console.log(elems.map((elem) => elem.element.feature.properties.name));
    },
  },
};
// #endregion config
