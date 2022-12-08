import { registry, PointElement } from 'chart.js';
import rnd from 'seedrandom';
import { feature } from 'topojson-client';
import { createRequire } from 'module';

import { GeoFeature } from '../elements';
import {
  ProjectionScale,
  SizeLogarithmicScale,
  SizeScale,
  ISizeScaleOptions,
  IProjectionScaleOptions,
} from '../scales';
import createChart from '../__tests__/createChart';
import { BubbleMapController } from './BubbleMapController';
import data from './__tests__/data';

const require = createRequire(import.meta.url); // construct the require method
const states10m = require('us-atlas/states-10m.json');

describe('bubbleMap', () => {
  beforeAll(() => {
    registry.addControllers(BubbleMapController);
    registry.addScales(ProjectionScale, SizeScale, SizeLogarithmicScale);
    registry.addElements(GeoFeature, PointElement);
  });

  test('default', async () => {
    const random = rnd('default');
    const us = states10m as any;
    const states = (feature(us, us.objects.states) as any).features;

    const chart = createChart({
      type: BubbleMapController.id,
      data: {
        labels: data.map((d) => d.description),
        datasets: [
          {
            outline: states,
            showOutline: true,
            backgroundColor: 'steelblue',
            data: data.map((d) => Object.assign(d, { value: Math.round(random() * 10) })),
          },
        ],
      },
      options: {
        scales: {
          projection: {
            axis: 'x',
            projection: 'albersUsa',
          } as Partial<IProjectionScaleOptions>,
          size: {
            axis: 'x',
            range: [1, 20],
            ticks: {
              display: false,
            },
          } as Partial<ISizeScaleOptions>,
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
  test('radius', async () => {
    const random = rnd('default');
    const us = states10m as any;
    const states = (feature(us, us.objects.states) as any).features;

    const chart = createChart({
      type: BubbleMapController.id,
      data: {
        labels: data.map((d) => d.description),
        datasets: [
          {
            outline: states,
            showOutline: true,
            backgroundColor: 'steelblue',
            data: data.map((d) => Object.assign(d, { value: Math.round(random() * 10) })),
          },
        ],
      },
      options: {
        scales: {
          projection: {
            axis: 'x',
            projection: 'albersUsa',
          } as Partial<IProjectionScaleOptions>,
          size: {
            axis: 'x',
            range: [1, 20],
            mode: 'radius',
            ticks: {
              display: false,
            },
          } as Partial<ISizeScaleOptions>,
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
  test('area', async () => {
    const random = rnd('default');
    const us = states10m as any;
    const states = (feature(us, us.objects.states) as any).features;

    const chart = createChart({
      type: BubbleMapController.id,
      data: {
        labels: data.map((d) => d.description),
        datasets: [
          {
            outline: states,
            showOutline: true,
            backgroundColor: 'steelblue',
            data: data.map((d) => Object.assign(d, { value: Math.round(random() * 10) })),
          },
        ],
      },
      options: {
        scales: {
          projection: {
            axis: 'x',
            projection: 'albersUsa',
          } as Partial<IProjectionScaleOptions>,
          size: {
            axis: 'x',
            range: [1, 20],
            mode: 'area',
            ticks: {
              display: false,
            },
          } as Partial<ISizeScaleOptions>,
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
  test('log', async () => {
    const random = rnd('default');
    const us = states10m as any;
    const states = (feature(us, us.objects.states) as any).features;

    const chart = createChart({
      type: BubbleMapController.id,
      data: {
        labels: data.map((d) => d.description),
        datasets: [
          {
            outline: states,
            showOutline: true,
            backgroundColor: 'steelblue',
            data: data.map((d) => Object.assign(d, { value: Math.round(random() * 10) })),
          },
        ],
      },
      options: {
        scales: {
          projection: {
            axis: 'x',
            projection: 'albersUsa',
          } as Partial<IProjectionScaleOptions>,
          size: {
            axis: 'x',
            type: SizeLogarithmicScale.id,
            range: [1, 20],
            ticks: {
              display: false,
            },
          },
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
});
