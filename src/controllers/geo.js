'use strict';

import * as Chart from 'chart.js';

const defaults = {
  animation: false,
  hover: {
		mode: 'single'
  },
  scale: {
    type: 'projection',
    id: 'scale',
    display: false
  },

	tooltips: {
		callbacks: {
			label: function(item, data) {
				const datasetLabel = data.datasets[item.datasetIndex].label || '';
				const dataPoint = data.datasets[item.datasetIndex].data[item.index];
				return datasetLabel + ': ' + dataPoint.value;
			}
		}
	}
};

export const geoDefaults = Chart.helpers.configMerge(Chart.defaults.global, defaults);

const superClass = Chart.DatasetController.prototype;
export const Geo = Chart.DatasetController.extend({
  dataElementType: Chart.elements.GeoFeature,

  _scale() {
    return this.getScaleForId('scale');
  },

  linkScales() {
    const meta = this.getMeta();
    meta.xAxisID = 'scale';
    meta.yAxisID = 'scale';

    const ds = this.getDataset();
    const outline = ds.outline || {type: 'Sphere'};
    this._scale().computeBounds(outline);
	},

  update(reset) {
    superClass.update.call(this, reset);

    this._scale().updateBounds();

    this.getMeta().data.forEach((elem, i) => {
      this.updateElement(elem, i, reset);
    });
  },

  updateElement(elem, index, reset) {
    const ds = this.getDataset();
    const meta = this.getMeta();
    const value = ds.data[index];

    elem.feature = value.feature;

		elem._xScale = this.getScaleForId(meta.xAxisID);
		elem._yScale = this.getScaleForId(meta.yAxisID);
		elem._datasetIndex = this.index;
    elem._index = index;
    elem._model = this._resolveElementOptions(elem, index, reset);

    elem.pivot();
  },

  _resolveElementOptions(elem, index, reset) {
		const chart = this.chart;
		const dataset = this.getDataset();
		const custom = elem.custom || {};
		const options = chart.options.elements.point;

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

    keys.forEach((key) => {
      values[key] = Chart.helpers.options.resolve([
				custom[key],
				dataset[key],
				options[key]
			], context, index);
    });

		return values;
	},

  transition(easingValue) {
    superClass.transition.call(this, easingValue);
  },

  draw() {
    superClass.draw.call(this);
    const chart = this.chart;

    Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);
    this.getMeta().data.forEach((elem) => elem.draw());
    Chart.helpers.canvas.unclipArea(chart.ctx);
  },
});
