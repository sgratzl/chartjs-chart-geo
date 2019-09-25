'use strict';

import * as Chart from 'chart.js';
import {geoPath, geoAlbersUsa} from 'd3-geo';

const defaults = {
  animation: false,
  hover: {
		mode: 'single'
	},
  scales: {
    xAxes: [{
      type: 'albers',
      display: false
    }],
    yAxes: [{
      type: 'albers',
      display: false
    }]
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

  initialize(chart, datasetIndex) {
    this.projection = geoAlbersUsa();
    this.geoPath = geoPath(this.projection);

    superClass.initialize.call(this, chart, datasetIndex);

    const ds = this.getDataset();
    const outline = ds.outline || {type: 'Sphere'};
    const bb = geoPath(this.projection.fitWidth(1000, outline)).bounds(outline);
    const bHeight = Math.ceil(bb[1][1] - bb[0][1]);
    const bWidth = Math.ceil(bb[1][0] - bb[0][0]);
    const t = this.projection.translate();

    this.outlineBounds = {
      width: bWidth,
      height: bHeight,
      aspectRatio: bWidth / bHeight,
      refScale: this.projection.scale(),
      refX: t[0],
      refY: t[1]
    };
  },

  update(reset) {
    superClass.update.call(this, reset);

    this.updateBounds();

    this.getMeta().data.forEach((elem, i) => {
      this.updateElement(elem, i, reset);
    });
  },

  updateBounds() {
    const area = this.chart.chartArea;
    const bb = this.outlineBounds;

		const chartWidth = area.right - area.left;
		const chartHeight = area.bottom - area.top;

    const scale = Math.min(chartWidth / bb.width, chartHeight / bb.height);
    const viewWidth = bb.width * scale;
    const viewHeight = bb.height * scale;

    const x = (chartWidth - viewWidth) * 0.5;
    const y = (chartHeight - viewHeight) * 0.5;

    // this.mapScale = scale;
    // this.mapTranslate = {x, y};

    this.projection
      .scale(bb.refScale * scale)
      .translate([scale * (bb.refX + x), scale * (bb.refY + y)]);
  },

  updateElement(elem, index, reset) {
    const ds = this.getDataset();
    const meta = this.getMeta();
    const value = ds.data[index];

    elem.feature = value.feature;
    elem.geoPath = this.geoPath;

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
			datasetIndex: this.index
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
    chart.ctx.save();
    // chart.ctx.scale(this.mapScale);
    // chart.ctx.translate(this.mapTranslate.x, this.mapTranslate.y);
    this.getMeta().data.forEach((elem) => elem.draw());
    chart.ctx.restore();
    Chart.helpers.canvas.unclipArea(chart.ctx);
  },
});
