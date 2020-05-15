import { scaleService, helpers, layouts } from 'chart.js';

export function resolveScale(chart, scaleOptions) {
  const scaleClass = scaleService.getScaleConstructor(scaleOptions.type);
  if (!scaleClass) {
    return null;
  }
  const s = new scaleClass({
    id: scaleOptions.id,
    type: scaleOptions.type,
    options: helpers.merge({}, [scaleService.getScaleDefaults(scaleOptions.type), scaleOptions]),
    ctx: chart.ctx,
    chart: chart,
  });
  s.mergeTicksOptions();

  s.fullWidth = s.options.fullWidth;
  s.position = 'chartArea';
  s.weight = s.options.weight;

  layouts.addBox(chart, s);
  return s;
}
