import { IChartComponentLike, registry, IDatasetControllerChartComponent } from '@sgratzl/chartjs-esm-facade';

export default function patchController<T, TYPE>(
  type: TYPE,
  config: T,
  controller: IDatasetControllerChartComponent,
  elements: IChartComponentLike = [],
  scales: IChartComponentLike = []
): T & { type: TYPE } {
  registry.addControllers(controller);
  registry.addElements(elements);
  registry.addScales(scales);
  const c = config as any;
  c.type = type;
  return c;
}
