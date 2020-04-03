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


const defaults = {
  interpolate: 'blues',
  missing: 'transparent',
  quantize: 0,
  domain: [0, 1]
};

const superClass = Chart.Scale.prototype;
export const ColorScale = Chart.Scale.extend({
  ticks: [],
  initialize() {
    superClass.initialize.call(this);
    if (typeof this.options.interpolate === 'string' && typeof lookup[this.options.interpolate] === 'function') {
      this.interpolate = lookup[this.options.interpolate];
    } else {
      this.interpolate = this.options.interpolate;
    }
    this._domain = this.options.domain;
  },
  updateDomain(data) {
    const domain = this.options.domain;
    if (typeof domain === 'function' || (domain !== 'auto' && !Number.isNaN(domain[0]) && !Number.isNaN(domain[1]))) {
      return; // static
    }
    const p = this.options.property;
    const min = data.reduce((acc, v) => Math.min(acc, v[p]), Number.POSITIVE_INFINITY);
    const max = data.reduce((acc, v) => Math.max(acc, v[p]), Number.NEGATIVE_INFINITY);

    if (domain === 'auto') {
      this._domain = [min, max];
    } else {
      this._domain = [Number.isNaN(domain[0]) ? min : domain[0], Number.isNaN(domain[1]) ? min : domain[1]];
    }
  },
  _normalize(v) {
    if (typeof this._domain === 'function') {
      return this._domain(v);
    }
    const d = this._domain;
    return (v - d[0]) / (d[1] - d[0]);
  },
  scale(value) {
    const v = value ? value[this.options.property] : null;
    if (v == null || Number.isNaN(v)) {
      return this.options.missing;
    }
    let n = this._normalize(v);
    if (n == null || Number.isNaN(n)) {
      return this.options.missing;
    }
    if (this.options.quantize > 0) {
      n = quantize(n, this.options.quantize);
    }
    return this.interpolate(n);
  }
});
Chart.scaleService.registerScaleType('color', ColorScale, defaults);
