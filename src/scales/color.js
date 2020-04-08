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
  position: 'chartArea',

  interpolate: 'blues',
  missing: 'transparent',
  property: 'value',
  quantize: 0,
  legend: {
    position: 'bottom-right',
    orientation: 'vertical',
    width: 40,
    height: 200,
    margin: 5,
  },
};

const superClass = Chart.LinearScaleBase.prototype;
export const ColorScale = Chart.LinearScaleBase.extend({
  initialize() {
    superClass.initialize.call(this);
    if (typeof this.options.interpolate === 'string' && typeof lookup[this.options.interpolate] === 'function') {
      this.interpolate = lookup[this.options.interpolate];
    } else {
      this.interpolate = this.options.interpolate;
    }
  },
  getRightValue(value) {
    if (typeof value === 'string') {
      return superClass.getRightValue.call(this, value);
    }
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
    return this.getColor(v);
  },
  getColor(normalized) {
    let v = normalized;
    if (this.options.quantize > 0) {
      v = quantize(v, this.options.quantize);
    }
    return this.interpolate(v);
  },
  update(maxWidth, maxHeight) {
    const l = this.options.legend;

    this.determineDataLimits();
    this.handleTickRangeOptions();
    this._configure();
    this.buildTicks();
    const ticks = this.ticks;
    const labels = this.convertTicksToLabels(this.ticks) || this.ticks;
    this.ticks = ticks.map((value, i) => ({value, label: labels[i]}));

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
  isHorizontal() {
    return superClass.isHorizontal.call(this) || this.options.legend.orientation === 'horizontal';
  },
  _getPosition(chartArea) {
    const w = this.minSize.width;
    const h = this.minSize.height;
    const margin = this.options.legend.margin;
    const marginLeft = typeof margin === 'number' ? margin : margin.left;
    const marginTop = typeof margin === 'number' ? margin : margin.top;
    const marginRight = typeof margin === 'number' ? margin : margin.right;
    const marginBottom = typeof margin === 'number' ? margin : margin.bottom;
    const pos = this.options.legend.position;
    if (typeof pos === 'string') {
      switch (this.options.legend.position) {
      case 'top-left':
        return [marginLeft, marginTop];
      case 'top':
        return [(chartArea.right - w) / 2, marginTop];
      case 'left':
        return [marginLeft, (chartArea.bottom - h) / 2];
      case 'top-right':
        return [chartArea.right - w - marginRight, marginTop];
      case 'bottom-right':
        return [chartArea.right - w - marginRight, chartArea.bottom - h - marginBottom];
      case 'bottom':
        return [(chartArea.right - w) / 2, chartArea.bottom - h - marginBottom];
      case 'bottom-left':
        return [marginLeft, chartArea.bottom - h - marginBottom];
      default: // right
        return [chartArea.right - w - marginRight, (chartArea.bottom - h) / 2];
      }
    }
    return [pos.x, pos.y];
  },
  draw(chartArea) {
    const [x, y] = this._getPosition(chartArea);
    const w = this.minSize.width;
    const h = this.minSize.height;
    /** @type {CanvasRenderingContext2D} */
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const wm = w / 3;
    const hm = h / 3;

    this._drawColors(w, h, wm, hm, ctx);
    this._drawColorTicks(w, h, wm, hm, ctx);
    ctx.restore();
  },
  /**
   * @param {number} w
   * @param {number} h
   * @param {number} wm
   * @param {number} hm
   * @param {CanvasRenderingContext2D} ctx
   */
  _drawColors(w, h, wm, hm, ctx) {
    if (this.isHorizontal()) {
      if (this.options.quantize > 0) {
        const stepWidth = w / this.options.quantize;
        for (let i = 0; i < w; i += stepWidth) {
          const v = (i + stepWidth / 2) / w;
          ctx.fillStyle = this.getColor(v);
          ctx.fillRect(i, 0, stepWidth, hm);
        }
      } else {
        for (let i = 0; i < w; ++i) {
          ctx.fillStyle = this.getColor((i + 0.5) / w);
          ctx.fillRect(i, 0, 1, hm);
        }
      }
    } else if (this.options.quantize > 0) {
      const stepWidth = h / this.options.quantize;
      for (let i = 0; i < h; i += stepWidth) {
        const v = (i + stepWidth / 2) / h;
        ctx.fillStyle = this.getColor(v);
        ctx.fillRect(0, i, wm, stepWidth);
      }
    } else {
      for (let i = 0; i < h; ++i) {
        ctx.fillStyle = this.getColor((i + 0.5) / h);
        ctx.fillRect(0, i, wm, 1);
      }
    }
  },
  // _computeColorTicks(w, h) {
  //   const ticks = [];
  //   const quantize = this.options.quantize;
  //   const isHor = this.isHorizontal();
  //   if (quantize > 0) {
  //     for (let i = 0; i <= this.options.quantize; ++i) {
  //       const normalized = i / quantize;
  //       const value = normalized * this._valueRange + this._startValue;
  //       const pixel = normalized * (isHor ? w : h);
  //       ticks.push({ value, pixel });
  //     }
  //   } else {

  //   }
  // return ticks;
  // }
  /**
   * @param {number} w
   * @param {number} h
   * @param {number} wm
   * @param {number} hm
   * @param {CanvasRenderingContext2D} ctx
   */
  _drawColorTicks(w, h, wm, hm, ctx) {
    const isHor = this.isHorizontal();

    // convertTicksToLabels({value: number})
    ctx.beginPath();
    if (isHor) {
      ctx.moveTo(0, hm);
      ctx.lineTo(w, hm);
    } else {
      ctx.moveTo(wm, 0);
      ctx.lineTo(wm, h);
    }

    ctx.strokeStyle = 'black';
    ctx.stroke();

  }
});

Chart.scaleService.registerScaleType('color', ColorScale, defaults);
