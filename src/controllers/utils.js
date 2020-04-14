import * as Chart from 'chart.js';

export function resolveScale(chart, scaleOptions) {
  const scaleClass = Chart.scaleService.getScaleConstructor(scaleOptions.type);
  if (!scaleClass) {
    return null;
  }
  const s = new scaleClass({
    id: scaleOptions.id,
    type: scaleOptions.type,
    options: Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults(scaleOptions.type), scaleOptions]),
    ctx: chart.ctx,
    chart: chart,
  });
  s.mergeTicksOptions();

  s.fullWidth = s.options.fullWidth;
  s.position = 'chartArea';
  s.weight = s.options.weight;

  Chart.layouts.addBox(chart, s);
  return s;
}
