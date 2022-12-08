import { feature } from 'topojson-client';
import { createRequire } from 'module';
import rnd from 'seedrandom';
import { registry } from 'chart.js';
import createChart from '../__tests__/createChart';
import {
  ColorLogarithmicScale,
  ColorScale,
  ProjectionScale,
  IProjectionScaleOptions,
  IColorScaleOptions,
} from '../scales';
import { ChoroplethController } from './ChoroplethController';
import { GeoFeature } from '../elements';

const require = createRequire(import.meta.url); // construct the require method
const states10m = require('us-atlas/states-10m.json');
const countries50m = require('world-atlas/countries-50m.json');

describe('choropleth', () => {
  beforeAll(() => {
    registry.addControllers(ChoroplethController);
    registry.addScales(ProjectionScale, ColorScale, ColorLogarithmicScale);
    registry.addElements(GeoFeature);
  });

  test('default', async () => {
    const random = rnd('default');
    const us = states10m as any;
    const nation = (feature(us, us.objects.nation) as any).features[0];
    const states = (feature(us, us.objects.states) as any).features as any[];

    const chart = createChart({
      type: ChoroplethController.id,
      data: {
        labels: states.map((d) => d.properties.name),
        datasets: [
          {
            label: 'States',
            outline: nation,
            data: states.map((d) => ({
              feature: d,
              value: random() * 10,
            })),
          },
        ],
      },
      options: {
        scales: {
          projection: {
            axis: 'x',
            projection: 'albersUsa',
          } as Partial<IProjectionScaleOptions>,
          color: {
            axis: 'x',
            quantize: 5,
            ticks: {
              display: false,
            },
            legend: {
              position: 'bottom-right',
              align: 'right',
            },
          } as Partial<IColorScaleOptions>,
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });

  test('log', async () => {
    const random = rnd('log');
    const us = states10m as any;
    const nation = (feature(us, us.objects.nation) as any).features[0];
    const states = (feature(us, us.objects.states) as any).features;

    const chart = createChart({
      type: ChoroplethController.id,
      data: {
        labels: states.map((d: any) => d.properties.name),
        datasets: [
          {
            label: 'States',
            outline: nation,
            data: states.map((d: any) => ({
              feature: d,
              value: random() * 10,
            })),
          },
        ],
      },
      options: {
        scales: {
          projection: {
            axis: 'x',
            projection: 'albersUsa',
          } as Partial<IProjectionScaleOptions>,
          color: {
            axis: 'x',
            type: ColorLogarithmicScale.id,
            quantize: 5,
            ticks: {
              display: false,
            },
            legend: {
              position: 'bottom-right',
              align: 'right',
            },
          },
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });

  test('earth', async () => {
    const random = rnd('earth');
    const data = countries50m as any;
    const countries = (feature(data, data.objects.countries) as any).features as any[];

    const chart = createChart({
      type: ChoroplethController.id,
      data: {
        labels: countries.map((d) => d.properties.name),
        datasets: [
          {
            label: 'Countries',
            data: countries.map((d) => ({
              feature: d,
              value: random(),
            })),
          },
        ],
      },
      options: {
        showOutline: true,
        showGraticule: true,
        scales: {
          projection: {
            axis: 'x',
            projection: 'equalEarth',
          } as Partial<IProjectionScaleOptions>,
          color: {
            axis: 'x',
            ticks: {
              display: false,
            },
          } as Partial<IColorScaleOptions>,
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
});
