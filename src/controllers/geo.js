'use strict';

import * as Chart from 'chart.js';

const defaults = {
  scales: {
    xAxes: [{
      type: 'albers',
      display: false
    }],
    yAxes: [{
      type: 'albers',
      display: false
    }]
  }
};

export const geoDefaults = Chart.helpers.configMerge(Chart.defaults.global, defaults);

const superClass = Chart.DatasetController.prototype;
export const Geo = Chart.DatasetController.extend({
  dataElementType: Chart.elements.GeoFeature,

  initialize(chart, datasetIndex) {
    superClass.initialize.call(this, chart, datasetIndex);
  },

  update(reset) {
    superClass.update.call(this, reset);
  },

  destroy() {
    superClass.destroy.call(this);
  },

  updateElement(point, index, reset) {
    superClass.updateElement.call(this, point, index, reset);
  },

  buildOrUpdateElements() {
    superClass.buildOrUpdateElements.call(this);
  },

  transition(easingValue) {
    superClass.transition.call(this, easingValue);
  },

  draw() {
    superClass.draw.call(this);
  },

  reset() {
    superClass.reset.call(this);
  },

  resyncElements() {
    superClass.resyncElements.call(this);
  },

  addElements() {
    superClass.addElements.call(this);
  }
});
