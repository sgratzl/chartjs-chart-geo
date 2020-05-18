import { scaleService, defaults, LinearScale, LogarithmicScale, merge, drawPoint } from '../chart';
import { baseDefaults, BaseMixin } from './base';

function SizeSaleMixin(superClass) {
  return class extends BaseMixin(superClass) {
    getSizeForValue(value) {
      const v = this._getNormalizedValue(value);
      if (v == null || Number.isNaN(v)) {
        return this.options.missing;
      }
      return this.getSizeImpl(v);
    }

    getSizeImpl(normalized) {
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
      const positions = this._labelItems || values.map((_, i) => ({ [isHor ? 'x' : 'y']: this.getPixelForTick(i) }));

      (this._gridLineItems || []).forEach((item) => {
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
        ctx.lineWidth = props.borderWidth == null ? defaults.elements.point.borderWidth : props.borderWidth;
        ctx.fillStyle = props.backgroundColor || defaults.color;
      } else {
        ctx.fillStyle = 'blue';
      }

      values.forEach((v, i) => {
        const pos = positions[i];
        const radius = this.getSizeForValue(v.value);
        const x = isHor ? pos.x : shift;
        const y = isHor ? shift : pos.y;
        const renderOptions = Object.assign({}, this._model || {}, {
          radius,
        });
        drawPoint(ctx, renderOptions, x, y);
      });
    }
  };
}

export class SizeScale extends SizeSaleMixin(LinearScale) {}

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

SizeScale.id = 'size';
SizeScale.defaults = merge({}, [LinearScale.defaults, baseDefaults, scaleDefaults]);
SizeScale.register = () => {
  scaleService.registerScale(SizeScale);
  return SizeScale;
};

export class SizeLogarithmicScale extends SizeSaleMixin(LogarithmicScale) {
  _getNormalizedValue(v) {
    if (v == null || Number.isNaN(v)) {
      return null;
    }
    return (Math.log10(v) - this._startValue) / this._valueRange;
  }
}

SizeLogarithmicScale.id = 'sizeLogarithmic';
SizeLogarithmicScale.defaults = merge({}, [LogarithmicScale.defaults, baseDefaults, scaleDefaults]);
SizeLogarithmicScale.register = () => {
  scaleService.registerScale(SizeLogarithmicScale);
  return SizeLogarithmicScale;
};
