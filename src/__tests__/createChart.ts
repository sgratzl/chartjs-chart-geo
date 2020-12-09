/// <reference types="jest" />
/// <reference types="node" />

import { Chart, ChartConfiguration, defaults, ChartType, DefaultDataPoint } from 'chart.js';
import { toMatchImageSnapshot, MatchImageSnapshotOptions } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

function toBuffer(canvas: HTMLCanvasElement) {
  return new Promise((resolve) => {
    canvas.toBlob((b) => {
      const file = new FileReader();
      file.onload = () => resolve(Buffer.from(file.result as ArrayBuffer));
      file.readAsArrayBuffer(b!);
    });
  });
}

export async function expectMatchSnapshot(canvas: HTMLCanvasElement) {
  const image = await toBuffer(canvas);
  expect(image).toMatchImageSnapshot();
}

export default function createChart<
  TYPE extends ChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>,
  LABEL = string
>(config: ChartConfiguration<TYPE, DATA, LABEL>, width = 800, height = 600) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  defaults.font.family = 'Courier New';
  defaults.font.color = 'transparent';
  config.options = Object.assign(
    {
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
    },
    config.options || {}
  ) as any;
  const ctx = canvas.getContext('2d')!;

  const t = new Chart<TYPE, DATA, LABEL>(ctx, config);

  return {
    chart: t,
    canvas,
    ctx,
    async toMatchImageSnapshot(options?: MatchImageSnapshotOptions) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const image = await toBuffer(canvas);
      expect(image).toMatchImageSnapshot(options);
    },
  };
}
