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

export function patchOptions(cfg) {
  cfg.options.position = 'chartArea';
  return cfg;
}

export const baseMixin = {
  isHorizontal() {
    return this.options.align === 'top' || this.options.align === 'bottom';
  },

  _getNormalizedValue(v) {
    if (v == null || Number.isNaN(v)) {
      return null;
    }
    return (v - this._startValue) / this._valueRange;
  },

  _getLegendMargin() {
    const indicatorWidth = this.options.legend.indicatorWidth;
    const pos = this.options.legend.align;
    const margin = this.options.legend.margin;

    const left = (typeof margin === 'number' ? margin : margin.left) + (pos === 'right' ? indicatorWidth : 0);
    const top = (typeof margin === 'number' ? margin : margin.top) + (pos === 'bottom' ? indicatorWidth : 0);
    const right = (typeof margin === 'number' ? margin : margin.right) + (pos === 'left' ? indicatorWidth : 0);
    const bottom = (typeof margin === 'number' ? margin : margin.bottom) + (pos === 'top' ? indicatorWidth : 0);
    return { left, top, right, bottom };
  },
  _getLegendPosition(chartArea) {
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
  },

  updateImpl(maxWidth, maxHeight, margins, callSuper) {
    const ch = Math.min(maxHeight, this.bottom);
    const cw = Math.min(maxWidth, this.right);

    const l = this.options.legend;
    const isHor = this.isHorizontal();
    const factor = (v, full) => (v < 1 ? full * v : v);
    const w = Math.min(cw, factor(isHor ? l.length : l.width, cw)) - (!isHor ? l.indicatorWidth : 0);
    const h = Math.min(ch, factor(!isHor ? l.length : l.width, ch)) - (isHor ? l.indicatorWidth : 0);
    this.legendSize = { w, h };
    this.bottom = this.height = h;
    this.right = this.width = w;

    const bak = this.options.position;
    this.options.position = this.options.legend.align;
    callSuper(w, h, margins);
    this.options.position = bak;
    this.height = Math.min(h, this.height);
    this.width = Math.min(w, this.width);
  },

  drawImpl(chartArea, callSuper) {
    if (!this._isVisible()) {
      return;
    }
    const pos = this._getLegendPosition(chartArea);
    /** @type {CanvasRenderingContext2D} */
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(pos[0], pos[1]);

    const bak = this.options.position;
    this.options.position = this.options.legend.align;
    callSuper(
      Object.assign({}, chartArea, {
        bottom: this.height,
        right: this.width,
      })
    );
    this.options.position = bak;
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
  },
};
