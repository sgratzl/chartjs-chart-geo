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
  position: 'right',
  interpolate: 'blues',
  missing: 'transparent',
  property: 'value',
  quantize: 0,
  gridLines: {
    drawOnChartArea: false,
  },
  legend: {
    position: 'bottom-right',
    length: 200,
    wide: 50,
    margin: 8,
    colorSize: 10,
  },
};

function createScale(superClassConstructor) {
  const superClass = superClassConstructor.prototype;
  return superClassConstructor.extend({
    initialize() {
      superClass.initialize.call(this);
      if (typeof this.options.interpolate === 'string' && typeof lookup[this.options.interpolate] === 'function') {
        this.interpolate = lookup[this.options.interpolate];
      } else {
        this.interpolate = this.options.interpolate;
      }
    },
    getRightValue(value) {
      if (value && typeof value[this.options.property] === 'number') {
        return value[this.options.property];
      }
      return superClass.getRightValue.call(this, value);
    },
    determineDataLimits() {
      const id = this.id;
      this.id = 'scale';
      superClass.determineDataLimits.call(this);
      this.id = id;
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
    update(maxWidth, maxHeight, margins) {
      const ch = Math.min(maxHeight, this.bottom);
      const cw = Math.min(maxWidth, this.right);

      const l = this.options.legend;
      const isHor = this.isHorizontal();
      const factor = (v, full) => v < 1 ? full * v : v;
      const w = Math.min(cw, factor(isHor ? l.length : l.wide, cw)) - (!isHor ? l.colorSize : 0);
      const h = Math.min(ch, factor(!isHor ? l.length : l.wide, ch)) - (isHor ? l.colorSize : 0);
      this.legendSize = {w, h};
      this.bottom = this.height = h;
      this.right = this.width = w;

      const r = superClass.update.call(this, w, h, margins);
      this.height = Math.min(h, this.height);
      this.width = Math.min(w, this.width);
      return r;
    },
    _getColorMargin() {
      const colorSize = this.options.legend.colorSize;
      const pos = this.options.position;
      const margin = this.options.legend.margin;

      const left = (typeof margin === 'number' ? margin : margin.left) + (pos === 'right' ? colorSize : 0);
      const top = (typeof margin === 'number' ? margin : margin.top) + (pos === 'bottom' ? colorSize : 0);
      const right = (typeof margin === 'number' ? margin : margin.right) + (pos === 'left' ? colorSize : 0);
      const bottom = (typeof margin === 'number' ? margin : margin.bottom) + (pos === 'top' ? colorSize : 0);
      return {left, top, right, bottom};
    },
    _getPosition(chartArea) {
      const isHor = this.isHorizontal();
      const axisPos = this.options.position;
      const colorSize = this.options.legend.colorSize;
      const w = (axisPos === 'left' ? this.legendSize.w : this.width) + (isHor ? colorSize : 0);
      const h = (axisPos === 'top' ? this.legendSize.h : this.height) + (!isHor ? colorSize : 0);
      const margin = this._getColorMargin();
      const pos = this.options.legend.position;

      if (typeof pos === 'string') {
        switch (pos) {
        case 'top-left':
          return [margin.left, margin.top];
        case 'top':
          return [(chartArea.right - w) / 2, margin.top];
        case 'left':
          return [margin.left, (chartArea.bottom - h) / 2];
        case 'top-right':
          return [chartArea.right - w - margin.right, margin.top];
        case 'bottom-right':
          return [chartArea.right - w - margin.right, chartArea.bottom - h - margin.bottom];
        case 'bottom':
          return [(chartArea.right - w) / 2, chartArea.bottom - h - margin.bottom];
        case 'bottom-left':
          return [margin.left, chartArea.bottom - h - margin.bottom];
        default: // right
          return [chartArea.right - w - margin.right, (chartArea.bottom - h) / 2];
        }
      }
      return [pos.x, pos.y];
    },
    draw(chartArea) {
      const pos = this._getPosition(chartArea);
      /** @type {CanvasRenderingContext2D} */
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(pos[0], pos[1]);

      superClass.draw.call(this, Object.assign({}, chartArea, {
        bottom: this.height,
        right: this.width,
      }));

      const colorSize = this.options.legend.colorSize;
      switch (this.options.position) {
      case 'left':
        ctx.translate(this.legendSize.w, 0);
        break;
      case 'top':
        ctx.translate(0, this.legendSize.h);
        break;
      case 'bottom':
        ctx.translate(0, -colorSize);
        break;
      default:
        ctx.translate(-colorSize, 0);
        break;
      }
      this._drawColors();

      ctx.restore();
    },
    _drawColors() {
      /** @type {CanvasRenderingContext2D} */
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const colorSize = this.options.legend.colorSize;
      const reverse = this._reversePixels;

      if (this.isHorizontal()) {
        if (this.options.quantize > 0) {
          const stepWidth = w / this.options.quantize;
          const offset = !reverse ? (i) => i : (i) => w - stepWidth - i;
          for (let i = 0; i < w; i += stepWidth) {
            const v = (i + stepWidth / 2) / w;
            ctx.fillStyle = this.getColor(v);
            ctx.fillRect(offset(i), 0, stepWidth, colorSize);
          }
        } else {
          const offset = !reverse ? (i) => i : (i) => w - 1 - i;
          for (let i = 0; i < w; ++i) {
            ctx.fillStyle = this.getColor((i + 0.5) / w);
            ctx.fillRect(offset(i), 0, 1, colorSize);
          }
        }
      } else if (this.options.quantize > 0) {
        const stepWidth = h / this.options.quantize;
        const offset = !reverse ? (i) => i : (i) => h - stepWidth - i;
        for (let i = 0; i < h; i += stepWidth) {
          const v = (i + stepWidth / 2) / h;
          ctx.fillStyle = this.getColor(v);
          ctx.fillRect(0, offset(i), colorSize, stepWidth);
        }
      } else {
        const offset = !reverse ? (i) => i : (i) => h - 1 - i;
        for (let i = 0; i < h; ++i) {
          ctx.fillStyle = this.getColor((i + 0.5) / h);
          ctx.fillRect(0, offset(i), colorSize, 1);
        }
      }
    }
  });
}

export const ColorScale = createScale(Chart.scaleService.getScaleConstructor('linear'));
export const ColorScaleLogarithmic = createScale(Chart.scaleService.getScaleConstructor('logarithmic'));

Chart.scaleService.registerScaleType('color', ColorScale, Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('linear'), defaults]));
Chart.scaleService.registerScaleType('colorLogarithmic', ColorScaleLogarithmic, Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('logarithmic'), defaults]));
