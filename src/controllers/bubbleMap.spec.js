import { BubbleMapController } from './bubbleMap';
import { SizeLogarithmicScale } from '../scales';
import { feature } from 'topojson-client';
import createChart from '../__tests__/createChart';
import states10m from 'us-atlas/states-10m.json';
import rnd from 'seedrandom';
import data from './__tests__/data';
import { registry } from '@sgratzl/chartjs-esm-facade';

describe('bubbleMap', () => {
  beforeAll(() => {
    registry.addControllers(BubbleMapController);
    registry.addScales(ProjectionScale, SizeScale, SizeLogarithmicScale);
    registry.addElements(GeoFeature);

  test('default', async () => {
    const random = rnd('default');
    const us = states10m;
    const states = feature(us, us.objects.states).features;

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
        legend: {
          display: false,
        },
        scales: {
          xy: {
            projection: 'albersUsa',
          },
          r: {
            size: [1, 20],
            ticks: {
              display: false,
            },
          },
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
  test('radius', async () => {
    const random = rnd('default');
    const us = states10m;
    const states = feature(us, us.objects.states).features;

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
        legend: {
          display: false,
        },
        scales: {
          xy: {
            projection: 'albersUsa',
          },
          r: {
            size: [1, 20],
            mode: 'radius',
            ticks: {
              display: false,
            },
          },
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
  test('area', async () => {
    const random = rnd('default');
    const us = states10m;
    const states = feature(us, us.objects.states).features;

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
        legend: {
          display: false,
        },
        scales: {
          xy: {
            projection: 'albersUsa',
          },
          r: {
            size: [1, 20],
            mode: 'area',
            ticks: {
              display: false,
            },
          },
        },
      },
    });

    return chart.toMatchImageSnapshot();
  });
  test('log', async () => {
    const random = rnd('default');
    const us = states10m;
    const states = feature(us, us.objects.states).features;

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
        legend: {
          display: false,
        },
        scales: {
          xy: {
            projection: 'albersUsa',
          },
          r: {
            type: SizeLogarithmicScale.id,
            size: [1, 20],
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
