import { Chart } from 'chart.js';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale, SizeScale } from '../build';

// register controller in chart.js and ensure the defaults are set
Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale, SizeScale);

const ctx = document.querySelector('canvas')!.getContext('2d')!;

const chart1 = new Chart(ctx, {
  type: 'choropleth',
  data: {
    labels: ['vs'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [
          {
            feature: null,
            value: 10,
          },
        ],
      },
    ],
  },
  options: {
    elements: {
      geoFeature: {
        outlineBorderColor: 'red',
      },
    },
    scales: {
      projection: {
        projection: 'albersUsa',
      },
      color: {
        quantize: 5,
        legend: {
          position: 'bottom-right',
          align: 'right',
        },
      },
    },
  },
});

const chart2 = new Chart(ctx, {
  type: 'bubbleMap',
  data: {
    labels: ['vs'],
    datasets: [
      {
        label: 'Dataset 1',
        backgroundColor: 'red',
        data: [
          {
            feature: null,
            value: 10,
          },
        ],
      },
    ],
  },
  options: {
    elements: {
      geoFeature: {
        outlineBorderColor: 'red',
      },
    },
    scales: {
      projection: {
        projection: 'albersUsa',
      },
      size: {
        legend: {
          position: 'bottom-right',
          align: 'right',
        },
      },
    },
  },
});
