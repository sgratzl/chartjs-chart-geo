import {
  defaults,
  LinearScale,
  LogarithmicScale,
  Scale,
  IPointOptions,
  ILinearScaleOptions,
  ILogarithmicScaleOptions,
  DeepPartial,
} from 'chart.js';
import { merge } from 'chart.js/helpers/core';
import { drawPoint } from 'chart.js/helpers/canvas';
import { baseDefaults, BaseMixin, ILegendScaleOptions } from './base';

export interface ISizeScaleOptions extends ILegendScaleOptions {
  // support all options from linear scale -> https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#linear-cartesian-axis
  // e.g. for tick manipulation, ...

  /**
   * whether to render a color legend
   * @default false (for compatibility reasons)
   */
  display: boolean;

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

  /**
   * the property name that stores the value in the data elements
   * @default value
   */
  property: string;

  legend: {
    /**
     * location of the legend on the chart area
     * @default bottom-right
     */
    position: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'top-right' | 'bottom-right';
    /**
     * alignment of the scale, e.g., `right` means that it is a vertical scale
     * with the ticks on the right side
     * @default bottom
     */
    align: 'left' | 'right' | 'top' | 'bottom';
    /**
     * length of the legend, i.e., for a horizontal scale the width
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 90
     */
    length: number;
    /**
     * how wide the scale is, i.e., for a horizontal scale the height
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 70
     */
    width: number;
    /**
     * how many pixels should be used for the color bar
     * @default 42
     */
    indicatorWidth: number;
    /**
     * margin pixels such that it doesn't stick to the edge of the chart
     * @default 8
     */
    margin: number;
  };
}

function SizeSaleMixin<O extends ISizeScaleOptions>(superClass: { new (...args: any[]): Scale<O> }) {
  return class extends BaseMixin(superClass) {
    _model: IPointOptions | null = null;

    getSizeForValue(value: number) {
      const v = this._getNormalizedValue(value);
      if (v == null || Number.isNaN(v)) {
        return this.options.missing;
      }
      return this.getSizeImpl(v);
    }

    getSizeImpl(normalized: number) {
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

    _drawIndicator() {
      /** @type {CanvasRenderingContext2D} */
      const ctx = this.ctx;
      const shift = this.options.legend.indicatorWidth / 2;

      const isHor = this.isHorizontal();
      const values = this.ticks;
      const positions =
        (this as any)._labelItems || values.map((_, i) => ({ [isHor ? 'x' : 'y']: this.getPixelForTick(i) }));

      ((this as any)._gridLineItems || []).forEach((item: any) => {
        ctx.save();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.width;

        if (ctx.setLineDash) {
          ctx.setLineDash(item.borderDash);
          ctx.lineDashOffset = item.borderDashOffset;
        }

        ctx.beginPath();

        if (this.options.gridLines.drawTicks) {
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
        ctx.strokeStyle = props.borderColor || defaults.color;
        ctx.lineWidth = props.borderWidth || 0;
        ctx.fillStyle = props.backgroundColor || defaults.color;
      } else {
        ctx.fillStyle = 'blue';
      }

      values.forEach((v, i) => {
        const pos = positions[i];
        const radius = this.getSizeForValue(v.value);
        const x = isHor ? pos.x : shift;
        const y = isHor ? shift : pos.y;
        const renderOptions = Object.assign(
          {
            pointStyle: 'circle' as const,
            borderWidth: 0,
          },
          this._model || {},
          {
            radius,
          }
        );
        drawPoint(ctx, renderOptions, x, y);
      });
    }
  };
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

export class SizeScale extends SizeSaleMixin<ISizeScaleOptions & ILinearScaleOptions>(LinearScale) {
  static readonly id = 'size';
  static readonly defaults = /*#__PURE__*/ merge({}, [LinearScale.defaults, baseDefaults, scaleDefaults]);
}

export class SizeLogarithmicScale extends SizeSaleMixin<ISizeScaleOptions & ILogarithmicScaleOptions>(
  LogarithmicScale
) {
  _getNormalizedValue(v: number) {
    if (v == null || Number.isNaN(v)) {
      return null;
    }
    return (Math.log10(v) - (this as any)._startValue) / (this as any)._valueRange;
  }

  static readonly id = 'sizeLogarithmic';
  static readonly defaults = /*#__PURE__*/ merge({}, [LogarithmicScale.defaults, baseDefaults, scaleDefaults]);
}

export interface ISizeScaleType extends DeepPartial<ISizeScaleOptions & ILinearScaleOptions> {
  type: 'size';
}
export interface ILogarithmicSizeScaleType extends DeepPartial<ISizeScaleOptions & ILogarithmicScaleOptions> {
  type: 'sizeLogarithmic';
}
