'use strict';

import * as Chart from 'chart.js';

const defaults = {
  showOutline: false,
  animation: false,
  scale: {
    type: 'projection',
    id: 'scale',
    display: false
  },
};

export const geoDefaults = Chart.helpers.configMerge(Chart.defaults.global, defaults);

const superClass = Chart.DatasetController.prototype;
export const Geo = Chart.DatasetController.extend({
  datasetElementType: Chart.elements.GeoFeature,

  getProjectionScale() {
    return this.getScaleForId('scale');
  },

  linkScales() {
    const meta = this.getMeta();
    meta.xAxisID = 'scale';
    meta.yAxisID = 'scale';

    this.getProjectionScale().computeBounds(this.resolveOutline());
  },

  showOutline() {
    return Chart.helpers.valueOrDefault(this.getDataset().showOutline, this.chart.options.showOutline);
  },

  update(reset) {
    superClass.update.call(this, reset);

    this.getProjectionScale().updateBounds();

    if (this.showOutline()) {
      this.updateGeoFeatureElement(this.getMeta().dataset, -1, reset);
    }

    this.getMeta().data.forEach((elem, i) => {
      this.updateElement(elem, i, reset);
    });
  },

  resolveOutline() {
    const ds = this.getDataset();
    const outline = ds.outline || {type: 'Sphere'};
    if (Array.isArray(outline)) {
      return {
        type: 'FeatureCollection',
        features: outline
      }
    }
    return outline;
  },

  updateElement(_elem, _index, _reset) {
    // no op
  },

  updateGeoFeatureElement(elem, index, reset) {
    const ds = this.getDataset();
    const meta = this.getMeta();

    elem.feature = index < 0 ? this.resolveOutline() : ds.data[index].feature;

		elem._xScale = this.getScaleForId(meta.xAxisID);
		elem._yScale = this.getScaleForId(meta.yAxisID);
		elem._datasetIndex = this.index;
    elem._index = index;
    elem._model = this.resolveGeoFeatureOptions(elem, index, reset);

    elem.pivot();
  },

  resolveGeoFeatureOptions(elem, index, reset) {
		const chart = this.chart;
		const dataset = this.getDataset();
		const custom = elem.custom || {};
		const options = chart.options.elements.geoFeature;

		// Scriptable options
		const context = {
			chart: chart,
			dataIndex: index,
			dataset: dataset,
      datasetIndex: this.index,
      reset
		};

		const keys = [
			'backgroundColor',
			'borderColor',
			'borderWidth',
			'hoverBackgroundColor',
			'hoverBorderColor',
			'hoverBorderWidth'
		];

    const values = {};

    keys.forEach((key, i) => {
      const arr = [
        custom[key],
        dataset[key],
        options[key]
      ];
      if (index < 0) { // outline
        const outlineKey = `outline${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        arr.unshift(
          custom[outlineKey],
          dataset[outlineKey],
          options[outlineKey]
        );
      }
      values[key] = Chart.helpers.options.resolve(arr, context, index);
    });

		return values;
	},

  transition(easingValue) {
    superClass.transition.call(this, easingValue);
  },

  draw() {
    const chart = this.chart;

    Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);

    if (this.showOutline()) {
      this.getMeta().dataset.draw();
    }

    this.getMeta().data.forEach((elem) => elem.draw());

    Chart.helpers.canvas.unclipArea(chart.ctx);
  },
});
