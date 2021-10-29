import { LinearScale, LogarithmicScale, PointOptions, LinearScaleOptions, LogarithmicScaleOptions } from 'chart.js';
import { merge, drawPoint } from 'chart.js/helpers';
import { baseDefaults, ILegendScaleOptions, LegendScale, LogarithmicLegendScale } from './LegendScale';

export interface ISizeScaleOptions extends ILegendScaleOptions {
  // support all options from linear scale -> https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#linear-cartesian-axis
  // e.g. for tick manipulation, ...

  /**
   * radius range in pixel, the minimal data value will be mapped to the
   * first entry,  the maximal one to the second and a linear interpolation
   * for all values in between.
   *
   * @default [2, 20]
   */
  range: [number, number];

  /**
   * operation mode for the scale, area means that the area is linearly increasing whereas radius the radius is.
   * The area one is the default since it gives a better visual comparison of values
   * @default area
   */
  mode: 'radius' | 'area';

  /**
   * radius to render for missing values
   * @default 1
   */
  missing: number;
}

const scaleDefaults = {
  missing: 1,
  mode: 'area', // 'radius'
  // mode: 'radius',
  range: [2, 20],
  legend: {
    align: 'bottom',
    length: 90,
    width: 70,
    indicatorWidth: 42,
  },
};

export class SizeScale extends LegendScale<ISizeScaleOptions & LinearScaleOptions> {
  _model: PointOptions | null = null;

  getSizeForValue(value: number): number {
    const v = this._getNormalizedValue(value);
    if (v == null || Number.isNaN(v)) {
      return this.options.missing;
    }
    return this.getSizeImpl(v);
  }

  getSizeImpl(normalized: number): number {
    const [r0, r1] = this.options.range;
    if (this.options.mode === 'area') {
      const a1 = r1 * r1 * Math.PI;
      const a0 = r0 * r0 * Math.PI;
      const range = a1 - a0;
      const a = normalized * range + a0;
      return Math.sqrt(a / Math.PI);
    }
    const range = r1 - r0;
    return normalized * range + r0;
  }

  _drawIndicator(): void {
    /** @type {CanvasRenderingContext2D} */
    const { ctx } = this;
    const shift = this.options.legend.indicatorWidth / 2;

    const isHor = this.isHorizontal();
    const values = this.ticks;
    const positions = (this as any)._labelItems
      ? (this as any)._labelItems.map((el: any) => ({ [isHor ? 'x' : 'y']: el.translation[isHor ? 0 : 1] }))
      : values.map((_, i) => ({ [isHor ? 'x' : 'y']: this.getPixelForTick(i) }));

    ((this as any)._gridLineItems || []).forEach((item: any) => {
      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.width;

      if (ctx.setLineDash) {
        ctx.setLineDash(item.borderDash);
        ctx.lineDashOffset = item.borderDashOffset;
      }

      ctx.beginPath();

      if (this.options.grid.drawTicks) {
        switch (this.options.legend.align) {
          case 'left':
            ctx.moveTo(0, item.ty1);
            ctx.lineTo(shift, item.ty2);
            break;
          case 'top':
            ctx.moveTo(item.tx1, 0);
            ctx.lineTo(item.tx2, shift);
            break;
          case 'bottom':
            ctx.moveTo(item.tx1, shift);
            ctx.lineTo(item.tx2, shift * 2);
            break;
          default:
            // right
            ctx.moveTo(shift, item.ty1);
            ctx.lineTo(shift * 2, item.ty2);
            break;
        }
      }
      ctx.stroke();
      ctx.restore();
    });

    if (this._model) {
      const props = this._model;
      ctx.strokeStyle = props.borderColor;
      ctx.lineWidth = props.borderWidth || 0;
      ctx.fillStyle = props.backgroundColor;
    } else {
      ctx.fillStyle = 'blue';
    }

    values.forEach((v, i) => {
      const pos = positions[i];
      const radius = this.getSizeForValue(v.value);
      const x = isHor ? pos.x : shift;
      const y = isHor ? shift : pos.y;
      const renderOptions = {
        pointStyle: 'circle' as const,
        borderWidth: 0,
        ...(this._model || {}),
        radius,
      };
      drawPoint(ctx, renderOptions, x, y);
    });
  }

  static readonly id = 'size';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [LinearScale.defaults, baseDefaults, scaleDefaults]);

  static readonly descriptors = /* #__PURE__ */ {
    _scriptable: true,
    _indexable: (name: string): boolean => name !== 'range',
  };
}

export class SizeLogarithmicScale extends LogarithmicLegendScale<ISizeScaleOptions & LogarithmicScaleOptions> {
  _model: PointOptions | null = null;

  getSizeForValue(value: number): number {
    const v = this._getNormalizedValue(value);
    if (v == null || Number.isNaN(v)) {
      return this.options.missing;
    }
    return this.getSizeImpl(v);
  }

  getSizeImpl(normalized: number): number {
    return SizeScale.prototype.getSizeImpl.call(this, normalized);
  }

  _drawIndicator(): void {
    SizeScale.prototype._drawIndicator.call(this);
  }

  static readonly id = 'sizeLogarithmic';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [LogarithmicScale.defaults, baseDefaults, scaleDefaults]);
}

declare module 'chart.js' {
  export interface SizeScaleTypeRegistry {
    size: {
      options: ISizeScaleOptions & LinearScaleOptions;
    };
    sizeLogarithmic: {
      options: ISizeScaleOptions & LogarithmicScaleOptions;
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ScaleTypeRegistry extends SizeScaleTypeRegistry {}
}
