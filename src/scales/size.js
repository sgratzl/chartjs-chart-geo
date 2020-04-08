'use strict';

import * as Chart from 'chart.js';
import {createBase, baseDefaults} from './base';

const defaults = {
  legend: {
    indicatorSize: 20,
  },
};

function createScale(superClassConstructor) {
  const superClass = superClassConstructor.prototype;
  return superClassConstructor.extend(Object.assign(createBase(superClass), {
    getRadiusForValue(value) {
      let v = value ? (+this.getRightValue(value) - this._startValue) / this._valueRange : null;
      if (v == null || Number.isNaN(v)) {
        return this.options.missing;
      }
      return this.getRadius(v);
    },
    getRadius(_normalized) {
      return 0; // TODO
    },
    _drawIndicator() {
      /** @type {CanvasRenderingContext2D} */
      // const ctx = this.ctx;
      // const w = this.width;
      // const h = this.height;
      // const indicatorSize = this.options.legend.indicatorWidth;
      // const reverse = this._reversePixels;

      if (this.isHorizontal()) {
        // TODO
      } else {
        // TODO
      }
    }
  }));
}

export const SizeScale = createScale(Chart.scaleService.getScaleConstructor('linear'));
export const SizeScaleLogarithmic = createScale(Chart.scaleService.getScaleConstructor('logarithmic'));

Chart.scaleService.registerScaleType('size', SizeScale, Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('linear'), baseDefaults, defaults]));
Chart.scaleService.registerScaleType('sizeLogarithmic', SizeScaleLogarithmic, Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('logarithmic'), baseDefaults, defaults]));
