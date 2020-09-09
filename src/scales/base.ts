import { Scale, IPadding, IChartArea, ICartesianScaleOptions } from 'chart.js';

export interface ILegendScaleOptions extends ICartesianScaleOptions {
  /**
   * whether to render a color legend
   * @default false (for compatibility reasons)
   */
  display: boolean;

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
    position:
      | 'left'
      | 'right'
      | 'top'
      | 'bottom'
      | 'top-left'
      | 'top-right'
      | 'top-right'
      | 'bottom-right'
      | 'bottom-left'
      | { x: number; y: number };
    /**
     * alignment of the scale, e.g., `right` means that it is a vertical scale
     * with the ticks on the right side
     * @default right
     */
    align: 'left' | 'right' | 'top' | 'bottom';
    /**
     * length of the legend, i.e., for a horizontal scale the width
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 100
     */
    length: number;
    /**
     * how wide the scale is, i.e., for a horizontal scale the height
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 50
     */
    width: number;
    /**
     * how many pixels should be used for the color bar
     * @default 10
     */
    indicatorWidth: number;
    /**
     * margin pixels such that it doesn't stick to the edge of the chart
     * @default 8
     */
    margin: number | IPadding;
  };
}

export const baseDefaults = {
  position: 'chartArea',
  property: 'value',
  gridLines: {
    drawOnChartArea: false,
  },
  legend: {
    align: 'right',
    position: 'bottom-right',
    length: 100,
    width: 50,
    margin: 8,
    indicatorWidth: 10,
  },
};

interface IPositionOption {
  position?: string;
}

export function BaseMixin<O extends ILegendScaleOptions>(superClass: { new (...args: any[]): Scale<O> }) {
  return class extends superClass {
    legendSize: { w: number; h: number } = { w: 0, h: 0 };

    init(options: O) {
      (options as IPositionOption).position = 'chartArea';
      super.init(options);
      this.axis = 'r';
    }

    parse(raw: any, index: number) {
      if (raw && typeof raw[this.options.property] === 'number') {
        return raw[this.options.property];
      }
      return super.parse(raw, index);
    }

    isHorizontal() {
      return this.options.legend.align === 'top' || this.options.legend.align === 'bottom';
    }

    _getNormalizedValue(v: number) {
      if (v == null || Number.isNaN(v)) {
        return null;
      }
      return (v - (this as any)._startValue) / (this as any)._valueRange;
    }

    _getLegendMargin() {
      const indicatorWidth = this.options.legend.indicatorWidth;
      const pos = this.options.legend.align;
      const margin = this.options.legend.margin;

      const left = (typeof margin === 'number' ? margin : margin.left) + (pos === 'right' ? indicatorWidth : 0);
      const top = (typeof margin === 'number' ? margin : margin.top) + (pos === 'bottom' ? indicatorWidth : 0);
      const right = (typeof margin === 'number' ? margin : margin.right) + (pos === 'left' ? indicatorWidth : 0);
      const bottom = (typeof margin === 'number' ? margin : margin.bottom) + (pos === 'top' ? indicatorWidth : 0);
      return { left, top, right, bottom };
    }

    _getLegendPosition(chartArea: IChartArea) {
      const indicatorWidth = this.options.legend.indicatorWidth;
      const axisPos = this.options.legend.align;
      const isHor = this.isHorizontal();
      const w = (axisPos === 'left' ? this.legendSize.w : this.width) + (isHor ? indicatorWidth : 0);
      const h = (axisPos === 'top' ? this.legendSize.h : this.height) + (!isHor ? indicatorWidth : 0);
      const margin = this._getLegendMargin();
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
          default:
            // right
            return [chartArea.right - w - margin.right, (chartArea.bottom - h) / 2];
        }
      }
      return [pos.x, pos.y];
    }

    update(maxWidth: number, maxHeight: number, margins: IChartArea) {
      const ch = Math.min(maxHeight, this.bottom == null ? Number.POSITIVE_INFINITY : this.bottom);
      const cw = Math.min(maxWidth, this.right == null ? Number.POSITIVE_INFINITY : this.right);

      const l = this.options.legend;
      const isHor = this.isHorizontal();
      const factor = (v: number, full: number) => (v < 1 ? full * v : v);
      const w = Math.min(cw, factor(isHor ? l.length : l.width, cw)) - (!isHor ? l.indicatorWidth : 0);
      const h = Math.min(ch, factor(!isHor ? l.length : l.width, ch)) - (isHor ? l.indicatorWidth : 0);
      this.legendSize = { w, h };
      this.bottom = this.height = h;
      this.right = this.width = w;

      const bak = (this.options as IPositionOption).position;
      (this.options as IPositionOption).position = this.options.legend.align;
      super.update(w, h, margins);
      (this.options as IPositionOption).position = bak;
      this.height = Math.min(h, this.height);
      this.width = Math.min(w, this.width);
    }

    draw(chartArea: IChartArea) {
      if (!(this as any)._isVisible()) {
        return;
      }
      const pos = this._getLegendPosition(chartArea);
      /** @type {CanvasRenderingContext2D} */
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(pos[0], pos[1]);

      const bak = (this.options as IPositionOption).position;
      (this.options as IPositionOption).position = this.options.legend.align;
      super.draw(
        Object.assign({}, chartArea, {
          bottom: this.height,
          right: this.width,
        })
      );
      (this.options as IPositionOption).position = bak;
      const indicatorWidth = this.options.legend.indicatorWidth;
      switch (this.options.legend.align) {
        case 'left':
          ctx.translate(this.legendSize.w, 0);
          break;
        case 'top':
          ctx.translate(0, this.legendSize.h);
          break;
        case 'bottom':
          ctx.translate(0, -indicatorWidth);
          break;
        default:
          ctx.translate(-indicatorWidth, 0);
          break;
      }
      this._drawIndicator();
      ctx.restore();
    }

    _drawIndicator() {
      // hook
    }
  };
}
