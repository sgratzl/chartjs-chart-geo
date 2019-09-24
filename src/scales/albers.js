'use strict';

import * as Chart from 'chart.js';

const albersOptions = Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('linear')]);

export const AlbersScale = Chart.scaleService.getScaleConstructor('linear').extend({
  // determineDataLimits() {
  //   commonDataLimits.call(this, this.isHorizontal());
  //   // Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
  //   this.handleTickRangeOptions();
  // }
});
Chart.scaleService.registerScaleType('albers', AlbersScale, albersOptions);
