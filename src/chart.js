import ChartNS from 'chart.js';

export const Chart = ChartNS;
export const defaults = ChartNS.defaults;

export function registerScale(scale) {
  ChartNS.scaleService.registerScale(scale);
  return scale;
}

export const Scale = ChartNS.Scale;
export const LinearScale = ChartNS.scaleService.getScaleConstructor('linear');
export const LogarithmicScale = ChartNS.scaleService.getScaleConstructor('logarithmic');

export const DatasetController = ChartNS.DatasetController;
// export const BarController = controllers.bar;
export const BubbleController = ChartNS.controllers.bubble;
// export const HorizontalBarController = controllers.horizontalBar;
// export const LineController = controllers.line;
// export const PolarAreaController = controllers.polarArea;
// export const ScatterController = controllers.scatter;

export function registerController(controller) {
  ChartNS.controllers[controller.id] = controller;
  ChartNS.defaults.set(controller.id, controller.defaults);
  return controller;
}

export const Element = ChartNS.Element;
// export const Rectangle = ChartNS.elements.Rectangle;
export const Point = ChartNS.elements.Point;
// export const Line = ChartNS.elements.Line;
// export const Arc = ChartNS.elements.Arc;

export function registerElement(element) {
  ChartNS.defaults.set('elements', {
    [element.id]: element.defaults,
  });
  return element;
}

export const merge = ChartNS.helpers.merge;
export const drawPoint = ChartNS.helpers.canvas.drawPoint;
// export const resolve = ChartNS.helpers.options.resolve;
// export const color = ChartNS.helpers.color;
export const valueOrDefault = ChartNS.helpers.valueOrDefault;
export const clipArea = ChartNS.helpers.canvas.clipArea;
export const unclipArea = ChartNS.helpers.canvas.unclipArea;

export function patchControllerConfig(config, controller) {
  controller.register();
  config.type = controller.id;
  return config;
}
