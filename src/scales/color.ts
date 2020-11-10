import { LinearScale, LogarithmicScale, Scale, LogarithmicScaleOptions, LinearScaleOptions } from 'chart.js';
import { merge } from 'chart.js/helpers';
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
  interpolateYlOrRd,
} from 'd3-scale-chromatic';
import { baseDefaults, BaseMixin, ILegendScaleOptions } from './base';

const lookup: { [key: string]: (normalizedValue: number) => string } = {
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
  interpolateYlOrRd,
};

Object.keys(lookup).forEach((key) => {
  lookup[`${key.charAt(11).toLowerCase()}${key.slice(12)}`] = lookup[key];
  lookup[key.slice(11)] = lookup[key];
});

function quantize(v: number, steps: number) {
  const perStep = 1 / steps;
  if (v <= perStep) {
    return 0;
  }
  if (v >= 1 - perStep) {
    return 1;
  }
  for (let acc = 0; acc < 1; acc += perStep) {
    if (v < acc) {
      return acc - perStep / 2; // center
    }
  }
  return v;
}

export interface IColorScaleOptions extends ILegendScaleOptions {
  // support all options from linear scale -> https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#linear-cartesian-axis
  // e.g. for tick manipulation, ...

  /**
   * color interpolation method which is either a function
   * converting a normalized value to string or a
   * well defined string of all the interpolation scales
   * from https://github.com/d3/d3-scale-chromatic.
   * e.g. interpolateBlues -> blues
   *
   * @default blues
   */
  interpolate:
    | ((normalizedValue: number) => string)
    | 'blues'
    | 'brBG'
    | 'buGn'
    | 'buPu'
    | 'cividis'
    | 'cool'
    | 'cubehelixDefault'
    | 'gnBu'
    | 'greens'
    | 'greys'
    | 'inferno'
    | 'magma'
    | 'orRd'
    | 'oranges'
    | 'pRGn'
    | 'piYG'
    | 'plasma'
    | 'puBu'
    | 'puBuGn'
    | 'puOr'
    | 'puRd'
    | 'purples'
    | 'rainbow'
    | 'rdBu'
    | 'rdGy'
    | 'rdPu'
    | 'rdYlBu'
    | 'rdYlGn'
    | 'reds'
    | 'sinebow'
    | 'spectral'
    | 'turbo'
    | 'viridis'
    | 'warm'
    | 'ylGn'
    | 'ylGnBu'
    | 'ylOrBr'
    | 'ylOrRd';

  /**
   * color value to render for missing values
   * @default transparent
   */
  missing: string;

  /**
   * allows to split the colorscale in N quantized equal bins.
   * @default 0
   */
  quantize: number;
}

function ColorScaleMixin<O extends IColorScaleOptions>(superClass: { new (...args: any[]): Scale<O> }) {
  return class extends BaseMixin(superClass) {
    private interpolate = (v: number) => `rgb(${v},${v},${v})`;

    init(options: O) {
      super.init(options);
      if (typeof options.interpolate === 'function') {
        this.interpolate = options.interpolate;
      } else {
        this.interpolate = lookup[options.interpolate] || lookup.blues;
      }
    }

    getColorForValue(value: number) {
      const v = this._getNormalizedValue(value);
      if (v == null || Number.isNaN(v)) {
        return this.options.missing;
      }
      return this.getColor(v);
    }

    getColor(normalized: number) {
      let v = normalized;
      if (this.options.quantize > 0) {
        v = quantize(v, this.options.quantize);
      }
      return this.interpolate(v);
    }

    _drawIndicator() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const indicatorSize = this.options.legend.indicatorWidth;
      const reverse = (this as any)._reversePixels;

      if (this.isHorizontal()) {
        if (this.options.quantize > 0) {
          const stepWidth = w / this.options.quantize;
          const offset = !reverse ? (i: number) => i : (i: number) => w - stepWidth - i;
          for (let i = 0; i < w; i += stepWidth) {
            const v = (i + stepWidth / 2) / w;
            ctx.fillStyle = this.getColor(v);
            ctx.fillRect(offset(i), 0, stepWidth, indicatorSize);
          }
        } else {
          const offset = !reverse ? (i: number) => i : (i: number) => w - 1 - i;
          for (let i = 0; i < w; ++i) {
            ctx.fillStyle = this.getColor((i + 0.5) / w);
            ctx.fillRect(offset(i), 0, 1, indicatorSize);
          }
        }
      } else if (this.options.quantize > 0) {
        const stepWidth = h / this.options.quantize;
        const offset = !reverse ? (i: number) => i : (i: number) => h - stepWidth - i;
        for (let i = 0; i < h; i += stepWidth) {
          const v = (i + stepWidth / 2) / h;
          ctx.fillStyle = this.getColor(v);
          ctx.fillRect(0, offset(i), indicatorSize, stepWidth);
        }
      } else {
        const offset = !reverse ? (i: number) => i : (i: number) => h - 1 - i;
        for (let i = 0; i < h; ++i) {
          ctx.fillStyle = this.getColor((i + 0.5) / h);
          ctx.fillRect(0, offset(i), indicatorSize, 1);
        }
      }
    }
  };
}

const colorScaleDefaults = {
  interpolate: 'blues',
  missing: 'transparent',
  quantize: 0,
};

export class ColorScale extends ColorScaleMixin<IColorScaleOptions & LinearScaleOptions>(LinearScale) {
  static readonly id = 'color';
  static readonly defaults = /*#__PURE__*/ merge({}, [LinearScale.defaults, baseDefaults, colorScaleDefaults]);
}

export class ColorLogarithmicScale extends ColorScaleMixin<IColorScaleOptions & LogarithmicScaleOptions>(
  LogarithmicScale
) {
  _getNormalizedValue(v: number) {
    if (v == null || Number.isNaN(v)) {
      return null;
    }
    return (Math.log10(v) - (this as any)._startValue) / (this as any)._valueRange;
  }

  static readonly id = 'colorLogarithmic';
  static readonly defaults = /*#__PURE__*/ merge({}, [LogarithmicScale.defaults, baseDefaults, colorScaleDefaults]);
}

declare module 'chart.js' {
  export enum ScaleTypeEnum {
    color = 'color',
    colorLogarithmic = 'colorLogarithmic',
  }

  export interface IScaleTypeRegistry {
    color: {
      options: IColorScaleOptions & LinearScaleOptions;
    };
    colorLogarithmic: {
      options: IColorScaleOptions & LogarithmicScaleOptions;
    };
  }
}
