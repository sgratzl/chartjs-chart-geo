'use strict';

import * as Chart from 'chart.js';
import {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOrRd,
  interpolateOranges,
  interpolatePRGn,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRainbow,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSinebow,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd
} from 'd3-scale-chromatic';

const lookup = {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOrRd,
  interpolateOranges,
  interpolatePRGn,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRainbow,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSinebow,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd
};

Object.keys(lookup).forEach((key) => {
  lookup[`${key.charAt(11).toLowerCase()}${key.slice(12)}`] = lookup[key];
  lookup[key.slice(11)] = lookup[key];
});


function quantize(v, steps) {
  const perStep = 1 / steps;
  if (v <= perStep) {
    return 0;
  }
  if (v >= (1 - perStep)) {
    return 1;
  }
  for (let acc = 0; acc < 1; acc += perStep) {
    if (v < acc) {
      return acc - perStep / 2; // center
    }
  }
  return v;
}


export const defaults = {
  position: 'chartArea',

  interpolate: 'blues',
  missing: 'transparent',
  property: 'value',
  quantize: 0,
  legend: {
    position: 'right',
    width: 40,
    height: 200,
  },
};

const superClass = Chart.Element.prototype;
export const ColorScale = Chart.Element.extend({
  initialize() {
    superClass.initialize.call(this);
    if (typeof this.options.interpolate === 'string' && typeof lookup[this.options.interpolate] === 'function') {
      this.interpolate = lookup[this.options.interpolate];
    } else {
      this.interpolate = this.options.interpolate;
    }
  },
  getRightValue(value) {
    return value[this.options.property];
  },
  determineDataLimits() {
    const chart = this.chart;
    // First Calculate the range
    this.min = null;
    this.max = null;

    // Regular charts use x, y values
    // For the boxplot chart we have rawValue.min and rawValue.max for each point
    chart.data.datasets.forEach((d, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!chart.isDatasetVisible(i)) {
        return;
      }
      d.data.forEach((rawValue, j) => {
        const value = this.getRightValue(rawValue);
        if (Number.isNaN(value) || meta.data[j].hidden) {
          return;
        }
        if (this.min === null || value < this.min) {
          this.min = value;
        }
        if (this.max === null || value > this.max) {
          this.max = value;
        }
      });
    });

    if (this.min == null) {
      this.min = 0;
    }
    if (this.max == null) {
      this.max = 0;
    }
  },
  getColorForValue(value) {
    let v = value ? (+this.getRightValue(value) - this._startValue) / this._valueRange : null;
    if (v == null || Number.isNaN(v)) {
      return this.options.missing;
    }
    if (this.options.quantize > 0) {
      v = quantize(v, this.options.quantize);
    }
    return this.interpolate(v);
  },
  update(maxWidth, maxHeight) {
    const l = this.options.legend;

    this.determineDataLimits();
    this._startValue = this.min;
    this._valueRange = this.max - this.min;

    const ch = Math.min(maxHeight, this.bottom);
    const cw = Math.min(maxWidth, this.right);
    const w = Math.min(cw, l.width < 1 ? cw * l.width : l.width);
    const h = Math.min(ch, l.height < 1 ? ch * l.height : l.height);
    this.minSize = {
      width: w,
      height: h
    };
    return this.minSize;
  },
  draw(chartArea) {
    // TODO
  }
});
