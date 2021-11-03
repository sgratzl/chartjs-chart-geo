/// <reference types="jest" />
/// <reference types="node" />

import { Chart, ChartConfiguration, defaults, ChartType, DefaultDataPoint } from 'chart.js';
import { toMatchImageSnapshot, MatchImageSnapshotOptions } from 'jest-image-snapshot';
import 'canvas-5-polyfill';

expect.extend({ toMatchImageSnapshot });

function toBuffer(canvas: HTMLCanvasElement) {
  return new Promise((resolve) => {
    canvas.toBlob((b) => {
      const file = new FileReader();
      file.onload = () => resolve(Buffer.from(file.result as ArrayBuffer));
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      file.readAsArrayBuffer(b!);
    });
  });
}

export async function expectMatchSnapshot(canvas: HTMLCanvasElement): Promise<void> {
  const image = await toBuffer(canvas);
  expect(image).toMatchImageSnapshot();
}

export interface ChartHelper<TYPE extends ChartType, DATA extends unknown[] = DefaultDataPoint<TYPE>, LABEL = string> {
  chart: Chart<TYPE, DATA, LABEL>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  toMatchImageSnapshot(options?: MatchImageSnapshotOptions): Promise<void>;
}

export default function createChart<
  TYPE extends ChartType,
  DATA extends unknown[] = DefaultDataPoint<TYPE>,
  LABEL = string
>(config: ChartConfiguration<TYPE, DATA, LABEL>, width = 800, height = 600): ChartHelper<TYPE, DATA, LABEL> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  Object.assign(defaults.font, { family: 'Courier New' });
  // defaults.color = 'transparent';
  // eslint-disable-next-line no-param-reassign
  config.options = {
    responsive: false,
    animation: {
      duration: 1,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    ...(config.options || {}),
  } as any;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
