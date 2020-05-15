import * as Chart from 'chart.js';
import { createBase, baseDefaults } from './base';

const defaults = {
  position: 'bottom',
  missing: 1,
  range: [1, 20],
  mode: 'radius' | 'area',
  legend: {
    length: 90,
    width: 70,
    indicatorWidth: 42,
  },
};

function createScale(superClassConstructor) {
  const superClass = superClassConstructor.prototype;
  return superClassConstructor.extend(
    Object.assign(createBase(superClass), {
      getSizeForValue(value) {
        const v = this._getNormalizedValue(value);
        if (v == null || Number.isNaN(v)) {
          return this.options.missing;
        }
        return this.getSizeImpl(v);
      },
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
      },
      _drawIndicator() {
        /** @type {CanvasRenderingContext2D} */
        const ctx = this.ctx;
        const shift = this.options.legend.indicatorWidth / 2;

        const isHor = this.isHorizontal();
        const values = this.ticksAsNumbers;
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
            switch (this.options.position) {
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
          const vm = this._model;
          ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
          ctx.lineWidth = vm.borderWidth == null ? Chart.elements.point.borderWidth : vm.borderWidth;
          ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;
        } else {
          ctx.fillStyle = 'blue';
        }

        values.forEach((v, i) => {
          const pos = positions[i];
          const radius = this.getSizeForValue(v);
          const x = isHor ? pos.x : shift;
          const y = isHor ? shift : pos.y;
          Chart.helpers.canvas.drawPoint(ctx, this._model ? this._model.pointStyle : null, radius, x, y, 0);
        });
      },
    })
  );
}

export const SizeScale = createScale(Chart.scaleService.getScaleConstructor('linear'));
export const SizeScaleLogarithmic = createScale(Chart.scaleService.getScaleConstructor('logarithmic'));

Chart.scaleService.registerScaleType(
  'size',
  SizeScale,
  Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('linear'), baseDefaults, defaults])
);
Chart.scaleService.registerScaleType(
  'sizeLogarithmic',
  SizeScaleLogarithmic,
  Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('logarithmic'), baseDefaults, defaults])
);
