import { registry } from 'chart.js';
import rnd from 'seedrandom';
import { feature } from 'topojson-client';
import states10m from 'us-atlas/states-10m.json';
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

describe('bubbleMap', () => {
  beforeAll(() => {
    registry.addControllers(BubbleMapController);
    registry.addScales(ProjectionScale, SizeScale, SizeLogarithmicScale);
    registry.addElements(GeoFeature);
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
          xy: {
            projection: 'albersUsa',
          } as IProjectionScaleOptions,
          r: {
            range: [1, 20],
            ticks: {
              display: false,
            },
          } as ISizeScaleOptions,
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
          xy: {
            projection: 'albersUsa',
          } as IProjectionScaleOptions,
          r: {
            range: [1, 20],
            mode: 'radius',
            ticks: {
              display: false,
            },
          } as ISizeScaleOptions,
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
          xy: {
            projection: 'albersUsa',
          } as IProjectionScaleOptions,
          r: {
            range: [1, 20],
            mode: 'area',
            ticks: {
              display: false,
            },
          } as ISizeScaleOptions,
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
          xy: {
            projection: 'albersUsa',
          } as IProjectionScaleOptions,
          r: {
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
