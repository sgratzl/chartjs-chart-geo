'use strict';

import * as Chart from 'chart.js';

const defaults = {};

Chart.defaults.global.elements.geoFeature = {
  ...Chart.defaults.global.elements.rectangle,
  ...defaults
};

export const GeoFeature = Chart.elements.GeoFeature = Chart.elements.rectangle.extend({
  draw() {
    // const vm = this._view;
    // const ctx = this._chart.ctx;
    Chart.elements.GeoFeature.prototype.call(this);
  }
});
