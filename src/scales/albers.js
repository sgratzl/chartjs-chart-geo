'use strict';

import * as Chart from 'chart.js';
import {} from 'd3-geo';

const defaults = {

};
const albersOptions = Chart.helpers.merge({}, [defaults]);

export const AlbersScale = Chart.Scale.extend({
  ticks: [],
  // determineDataLimits() {
  //   commonDataLimits.call(this, this.isHorizontal());
  //   // Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
  //   this.handleTickRangeOptions();
  // }
});
Chart.scaleService.registerScaleType('albers', AlbersScale, albersOptions);
