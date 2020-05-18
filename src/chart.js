import ChartNS from 'chart.js';

export const Chart = ChartNS;
// export const plugins = ChartNS.plugins;
export const controllers = ChartNS.controllers;
export const defaults = ChartNS.defaults;
// export const helpers = ChartNS.helpers;
export const scaleService = ChartNS.scaleService;

export const Scale = ChartNS.Scale;
export const LinearScale = ChartNS.scaleService.getScaleConstructor('linear');
export const LogarithmicScale = ChartNS.scaleService.getScaleConstructor('logarithmic');

export const DatasetController = ChartNS.DatasetController;
// export const BarController = controllers.bar;
export const BubbleController = controllers.bubble;
// export const HorizontalBarController = controllers.horizontalBar;
// export const LineController = controllers.line;
// export const PolarAreaController = controllers.polarArea;
// export const ScatterController = controllers.scatter;

export const Element = ChartNS.Element;
// export const Rectangle = ChartNS.elements.Rectangle;
export const Point = ChartNS.elements.Point;
// export const Line = ChartNS.elements.Line;
// export const Arc = ChartNS.elements.Arc;

export const merge = ChartNS.helpers.merge;
export const drawPoint = ChartNS.helpers.canvas.drawPoint;
// export const resolve = ChartNS.helpers.options.resolve;
// export const color = ChartNS.helpers.color;
export const valueOrDefault = ChartNS.helpers.valueOrDefault;
export const clipArea = ChartNS.helpers.canvas.clipArea;
export const unclipArea = ChartNS.helpers.canvas.unclipArea;
