import { ChoroplethController } from './choropleth';
import { ColorLogarithmicScale } from '../scales';
import { feature } from 'topojson-client';
import createChart from '../__tests__/createChart';
import states10m from 'us-atlas/states-10m.json';
import countries50m from 'world-atlas/countries-50m.json';
import rnd from 'seedrandom';

describe('choropleth', () => {
  beforeAll(() => {
    ChoroplethController.register();
  });

  test('default', async () => {
    const random = rnd('default');
    const us = states10m;
    const nation = feature(us, us.objects.nation).features[0];
    const states = feature(us, us.objects.states).features;

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
        legend: {
          display: false,
        },
        scales: {
          xy: {
            projection: 'albersUsa',
          },
          color: {
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

  test('log', async () => {
    const random = rnd('log');
    const us = states10m;
    const nation = feature(us, us.objects.nation).features[0];
    const states = feature(us, us.objects.states).features;

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
        legend: {
          display: false,
        },
        scales: {
          xy: {
            projection: 'albersUsa',
          },
          color: {
            type: ColorLogarithmicScale.register().id,
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
    const data = countries50m;
    const countries = feature(data, data.objects.countries).features;

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
        legend: {
          display: false,
        },
        scales: {
          xy: {
            projection: 'equalEarth',
          },
          color: {
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
