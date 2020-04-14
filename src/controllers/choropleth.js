import * as Chart from 'chart.js';
import { geoDefaults, Geo } from './geo';
import { wrapProjectionScale } from '../scales';
import { resolveScale } from './utils';

const defaults = {
  hover: {
    mode: 'single',
  },
  tooltips: {
    callbacks: {
      title() {
        // Title doesn't make sense for scatter since we format the data as a point
        return '';
      },
      label(item, data) {
        if (item.value == null) {
          return data.labels[item.index];
        }
        return `${data.labels[item.index]}: ${item.value}`;
      },
    },
  },
  geo: {
    colorScale: {
      display: false,
      id: 'color',
      type: 'color',
    },
  },
  elements: {
    geoFeature: {
      backgroundColor(context) {
        if (context.dataIndex == null) {
          return null;
        }
        const value = context.dataset.data[context.dataIndex];
        const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
        return controller.valueToColor(value);
      },
    },
  },
};

Chart.defaults.choropleth = Chart.helpers.configMerge(geoDefaults, defaults);

const superClass = Geo.prototype;
export const Choropleth = (Chart.controllers.choropleth = Geo.extend({
  dataElementType: Chart.elements.GeoFeature,

  linkScales() {
    superClass.linkScales.call(this);
    if (this._colorScale) {
      Chart.layouts.removeBox(this.chart, this._colorScale);
    }
    this._colorScale = resolveScale(this.chart, this.chart.options.geo.colorScale);
  },

  _getValueScale() {
    const base = superClass._getValueScale.call(this);
    if (!this._colorScale) {
      return base;
    }
    return wrapProjectionScale(base, this._colorScale.options.property);
  },

  updateElement(elem, index, reset) {
    superClass.updateElement.call(this, elem, index, reset);
    this.updateGeoFeatureElement(elem, index, reset);
  },

  valueToColor(value) {
    return this._colorScale ? this._colorScale.getColorForValue(value) : 'blue';
  },
}));
