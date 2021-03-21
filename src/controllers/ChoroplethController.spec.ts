import { feature } from 'topojson-client';
import states10m from 'us-atlas/states-10m.json';
import countries50m from 'world-atlas/countries-50m.json';
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
          xy: {
            projection: 'albersUsa',
          } as IProjectionScaleOptions,
          color: {
            quantize: 5,
            ticks: {
              display: false,
            },
            legend: {
              position: 'bottom-right',
              align: 'right',
            },
          } as IColorScaleOptions,
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
          xy: {
            projection: 'albersUsa',
          } as IProjectionScaleOptions,
          color: {
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
          xy: {
            projection: 'equalEarth',
          } as IProjectionScaleOptions,
          color: {
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
