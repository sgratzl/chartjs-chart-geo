'use strict';

import * as Chart from 'chart.js';
import {} from 'd3-geo';

const defaults = {};

Chart.defaults.global.elements.geoFeature = {
  ...Chart.defaults.global.elements.rectangle,
  ...defaults
};

const superClass = Chart.Element.prototype;
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
    if (this.c) {
      return this.c;
    }
    const centroid = this._xScale.geoPath.centroid(this.feature);
    return this.c = {
      x: centroid[0],
      y: centroid[1]
    };
  },

  getBounds() {
    if (this.b) {
      return this.b;
    }
    const [[x0, y0], [x1, y1]] = this._xScale.geoPath.bounds(this.feature);
    this.b = {
      x: x0,
      x2: x1,
      y: y0,
      y2: y1,
      width: x1 - x0,
      height: y1 - y0
    };
    return this.b;
  },

  getArea() {
    if (this.a) {
      return this.a;
    }
    return this.a = this._xScale.geoPath.area(this.feature);
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
