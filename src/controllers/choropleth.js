'use strict';

import * as Chart from 'chart.js';
import {geoDefaults, Geo} from './geo';
import {wrapProjectionScale} from '../scales';

const defaults = {
  hover: {
    mode: 'single'
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
      }
    }
  },
  geo: {
    colorScale: {
      id: 'color',
      type: 'color',
      property: 'value'
    }
  },
  elements: {
    geoFeature: {
      backgroundColor(context) {
        if (context.dataIndex == null) {
          return null;
        }
        const value = context.dataset.data[context.dataIndex];
        return context.controller.valueToColor(value);
      },
    }
  }
};

Chart.defaults.choropleth = Chart.helpers.configMerge(geoDefaults, defaults);

const superClass = Geo.prototype;
export const Choropleth = Chart.controllers.choropleth = Geo.extend({
  dataElementType: Chart.elements.GeoFeature,

  linkScales() {
    superClass.linkScales.call(this);
    this._colorScale = this._resolveColorScale();
  },

  _getValueScale() {
    const base = superClass._getValueScale.call(this);
    if (!this._colorScale) {
      return base;
    }
    return wrapProjectionScale(base, this._colorScale.options.property);
  },

  _resolveColorScale() {
    const scaleOptions = this.chart.options.geo.colorScale;
    const scaleClass = Chart.scaleService.getScaleConstructor(scaleOptions.type);
    if (!scaleClass) {
      return null;
    }
    return new scaleClass({
      id: scaleOptions.id,
      type: scaleOptions.type,
      options: Object.assign({}, Chart.scaleService.getScaleDefaults(scaleOptions.type), scaleOptions),
      ctx: this.chart.ctx,
      chart: this.chart
    });
  },

  update(reset) {
    if (this._colorScale) {
      this._colorScale.updateDomain(this.getDataset().data);
    }
    superClass.update.call(this, reset);
  },

  updateElement(elem, index, reset) {
    superClass.updateElement.call(this, elem, index, reset);
    this.updateGeoFeatureElement(elem, index, reset);
  },

  valueToColor(value) {
    return this._colorScale ? this._colorScale.scale(value) : 'blue';
  }
});
