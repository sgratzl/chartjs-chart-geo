import { registry, IDatasetControllerChartComponent, IChartComponent } from 'chart.js';

export default function patchController<T, TYPE>(
  type: TYPE,
  config: T,
  controller: IDatasetControllerChartComponent,
  elements: IChartComponent | IChartComponent[] = [],
  scales: IChartComponent | IChartComponent[] = []
): T & { type: TYPE } {
  registry.addControllers(controller);
  if (Array.isArray(elements)) {
    registry.addElements(...elements);
  } else {
    registry.addElements(elements);
  }
  if (Array.isArray(scales)) {
    registry.addScales(...scales);
  } else {
    registry.addScales(scales);
  }
  const c = config as any;
  c.type = type;
  return c;
}
