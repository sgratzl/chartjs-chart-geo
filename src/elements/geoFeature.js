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
    return (Number.isNaN(mouseX) || (mouseX >= bb.x && mouseX <= bb.x2)) &&
      (Number.isNaN(mouseY) || (mouseY >= bb.y && mouseY <= bb.y2));
	},

  inLabelRange(mouseX) {
    return this.inRange(mouseX, NaN);
  },
	inXRange(mouseX) {
    return this.inRange(mouseX, NaN);
  },
	inYRange(mouseY) {
    return this.inRange(NaN, mouseY);
  },

  getCenterPoint() {
    const centroid = this.geoPath.centroid(this.feature);
    return {
      x: centroid[0],
      y: centroid[1]
    };
  },

  getBounds() {
    const [[x0, y0], [x1, y1]] = this.geoPath.bounds(this.feature);
    return {
      x: x0,
      x2: x1,
      y: y0,
      y2: y1,
      width: x1 - x0,
      height: y1 - y0
    };
  },

  getArea() {
    return this.geoPath.area(this.feature);
	},

	tooltipPosition() {
		return this.getCenterPoint();
	},

  draw() {
    const vm = this._view;
    const ctx = this._chart.ctx;
    ctx.save();
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = vm.borderWidth;
    ctx.fillStyle = vm.backgroundColor;
    ctx.beginPath();
    this.geoPath.context(ctx)(this.feature);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // superClass.draw.call(this);
  }
});
