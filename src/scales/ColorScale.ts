import { LinearScale, LogarithmicScale, LogarithmicScaleOptions, LinearScaleOptions } from 'chart.js';
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
import { baseDefaults, LegendScale, LogarithmicLegendScale, ILegendScaleOptions } from './LegendScale';

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
   * allows to split the color scale in N quantized equal bins.
   * @default 0
   */
  quantize: number;
}

const colorScaleDefaults = {
  interpolate: 'blues',
  missing: 'transparent',
  quantize: 0,
};

export class ColorScale extends LegendScale<IColorScaleOptions & LinearScaleOptions> {
  get interpolate(): (v: number) => string {
    const o = this.options as IColorScaleOptions & LinearScaleOptions;
    if (!o) {
      return (v: number) => `rgb(${v},${v},${v})`;
    }
    if (typeof o.interpolate === 'function') {
      return o.interpolate;
    }
    return lookup[o.interpolate] || lookup.blues;
  }

  getColorForValue(value: number): string {
    const v = this._getNormalizedValue(value);
    if (v == null || Number.isNaN(v)) {
      return this.options.missing;
    }
    return this.getColor(v);
  }

  getColor(normalized: number): string {
    let v = normalized;
    if (this.options.quantize > 0) {
      v = quantize(v, this.options.quantize);
    }
    return this.interpolate(v);
  }

  _drawIndicator(): void {
    const { indicatorWidth: indicatorSize } = this.options.legend;
    const reverse = (this as any)._reversePixels;

    if (this.isHorizontal()) {
      const w = this.width;
      if (this.options.quantize > 0) {
        const stepWidth = w / this.options.quantize;
        const offset = !reverse ? (i: number) => i : (i: number) => w - stepWidth - i;
        for (let i = 0; i < w; i += stepWidth) {
          const v = (i + stepWidth / 2) / w;
          this.ctx.fillStyle = this.getColor(v);
          this.ctx.fillRect(offset(i), 0, stepWidth, indicatorSize);
        }
      } else {
        const offset = !reverse ? (i: number) => i : (i: number) => w - 1 - i;
        for (let i = 0; i < w; i += 1) {
          this.ctx.fillStyle = this.getColor((i + 0.5) / w);
          this.ctx.fillRect(offset(i), 0, 1, indicatorSize);
        }
      }
    } else {
      const h = this.height;
      if (this.options.quantize > 0) {
        const stepWidth = h / this.options.quantize;
        const offset = !reverse ? (i: number) => i : (i: number) => h - stepWidth - i;
        for (let i = 0; i < h; i += stepWidth) {
          const v = (i + stepWidth / 2) / h;
          this.ctx.fillStyle = this.getColor(v);
          this.ctx.fillRect(0, offset(i), indicatorSize, stepWidth);
        }
      } else {
        const offset = !reverse ? (i: number) => i : (i: number) => h - 1 - i;
        for (let i = 0; i < h; i += 1) {
          this.ctx.fillStyle = this.getColor((i + 0.5) / h);
          this.ctx.fillRect(0, offset(i), indicatorSize, 1);
        }
      }
    }
  }

  static readonly id = 'color';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [LinearScale.defaults, baseDefaults, colorScaleDefaults]);

  static readonly descriptors = /* #__PURE__ */ {
    _scriptable: (name: string): boolean => name !== 'interpolate',
    _indexable: false,
  };
}

export class ColorLogarithmicScale extends LogarithmicLegendScale<IColorScaleOptions & LogarithmicScaleOptions> {
  private interpolate = (v: number) => `rgb(${v},${v},${v})`;

  init(options: IColorScaleOptions & LinearScaleOptions): void {
    super.init(options);
    if (typeof options.interpolate === 'function') {
      this.interpolate = options.interpolate;
    } else {
      this.interpolate = lookup[options.interpolate] || lookup.blues;
    }
  }

  getColorForValue(value: number): string {
    return ColorScale.prototype.getColorForValue.call(this, value);
  }

  getColor(normalized: number): string {
    let v = normalized;
    if (this.options.quantize > 0) {
      v = quantize(v, this.options.quantize);
    }
    return this.interpolate(v);
  }

  protected _drawIndicator(): void {
    return ColorScale.prototype._drawIndicator.call(this);
  }

  static readonly id = 'colorLogarithmic';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    LogarithmicScale.defaults,
    baseDefaults,
    colorScaleDefaults,
  ]);

  static readonly descriptors = /* #__PURE__ */ {
    _scriptable: (name: string): boolean => name !== 'interpolate',
    _indexable: false,
  };
}

declare module 'chart.js' {
  export interface ColorScaleTypeRegistry {
    color: {
      options: IColorScaleOptions & LinearScaleOptions;
    };
    colorLogarithmic: {
      options: IColorScaleOptions & LogarithmicScaleOptions;
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ScaleTypeRegistry extends ColorScaleTypeRegistry {}
}
