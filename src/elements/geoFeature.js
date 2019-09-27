'use strict';

import * as Chart from 'chart.js';

const defaults = {
  outlineBackgroundColor: null,
  outlineBorderColor: Chart.defaults.global.defaultColor,
  outlineBorderWidth: 0,

  graticuleBorderColor: '#CCCCCC',
  graticuleBorderWidth: 0,
};

Chart.defaults.global.elements.geoFeature = {
  ...Chart.defaults.global.elements.rectangle,
  ...defaults
};

// const superClass = Chart.Element.prototype;
export const GeoFeature = Chart.elements.GeoFeature = Chart.Element.extend({
  inRange(mouseX, mouseY) {
    const bb = this.getBounds();
    const r = (Number.isNaN(mouseX) || (mouseX >= bb.x && mouseX <= bb.x2)) &&
      (Number.isNaN(mouseY) || (mouseY >= bb.y && mouseY <= bb.y2));

    return r;
  },

  inLabelRange(mouseX, mouseY) {
    return this.inRange(mouseX, mouseY);
  },
  inXRange(mouseX) {
    return this.inRange(mouseX, NaN);
  },
  inYRange(mouseY) {
    return this.inRange(NaN, mouseY);
  },

  getCenterPoint() {
    if (this.cache && this.cache.center) {
      return this.cache.center;
    }
    const centroid = this._xScale.geoPath.centroid(this.feature);
    const center = {
      x: centroid[0],
      y: centroid[1]
    };
    this.cache = {
      ...(this.cache || {}),
      center
    };
    return center;
  },

  getBounds() {
    if (this.cache && this.cache.bounds) {
      return this.cache.bounds;
    }
    const [[x0, y0], [x1, y1]] = this._xScale.geoPath.bounds(this.feature);
    const bounds = {
      x: x0,
      x2: x1,
      y: y0,
      y2: y1,
      width: x1 - x0,
      height: y1 - y0
    };
    this.cache = {
      ...(this.cache || {}),
      bounds
    };
    return bounds;
  },

  getArea() {
    if (this.cache && this.cache.area) {
      return this.cache.area;
    }
    const area = this._xScale.geoPath.area(this.feature);

    this.cache = {
      ...(this.cache || {}),
      area
    };
    return area;
  },

  tooltipPosition() {
    return this.getCenterPoint();
  },

  draw() {
    if (!this.feature) {
      return;
    }

    const vm = this._view;
    const ctx = this._chart.ctx;
    ctx.save();
    ctx.beginPath();
    this._xScale.geoPath.context(ctx)(this.feature);
    if (vm.backgroundColor) {
      ctx.fillStyle = vm.backgroundColor;
      ctx.fill();
    }
    if (vm.borderColor) {
      ctx.strokeStyle = vm.borderColor;
      ctx.lineWidth = vm.borderWidth;
      ctx.stroke();
    }
    ctx.restore();
  }
});
