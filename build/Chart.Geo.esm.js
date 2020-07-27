import { Element, Rectangle, Scale, merge, LinearScale, LogarithmicScale, defaults, drawPoint, DatasetController, valueOrDefault, clipArea, unclipArea, registry, Chart, Point, BubbleController } from '@sgratzl/chartjs-esm-facade';
import { geoContains, geoPath, geoAzimuthalEqualArea, geoAzimuthalEquidistant, geoGnomonic, geoOrthographic, geoStereographic, geoEqualEarth, geoAlbers, geoAlbersUsa, geoConicConformal, geoConicEqualArea, geoConicEquidistant, geoEquirectangular, geoMercator, geoTransverseMercator, geoNaturalEarth1, geoGraticule10, geoGraticule } from 'd3-geo';
import { interpolateBlues, interpolateBrBG, interpolateBuGn, interpolateBuPu, interpolateCividis, interpolateCool, interpolateCubehelixDefault, interpolateGnBu, interpolateGreens, interpolateGreys, interpolateInferno, interpolateMagma, interpolateOrRd, interpolateOranges, interpolatePRGn, interpolatePiYG, interpolatePlasma, interpolatePuBu, interpolatePuBuGn, interpolatePuOr, interpolatePuRd, interpolatePurples, interpolateRainbow, interpolateRdBu, interpolateRdGy, interpolateRdPu, interpolateRdYlBu, interpolateRdYlGn, interpolateReds, interpolateSinebow, interpolateSpectral, interpolateTurbo, interpolateViridis, interpolateWarm, interpolateYlGn, interpolateYlGnBu, interpolateYlOrBr, interpolateYlOrRd } from 'd3-scale-chromatic';
import * as t from 'topojson-client';

class GeoFeature extends Element {
  inRange(mouseX, mouseY) {
    const bb = this.getBounds();
    const r =
      (Number.isNaN(mouseX) || (mouseX >= bb.x && mouseX <= bb.x2)) &&
      (Number.isNaN(mouseY) || (mouseY >= bb.y && mouseY <= bb.y2));

    const projection = this.projectionScale.geoPath.projection();
    if (r && !Number.isNaN(mouseX) && !Number.isNaN(mouseY) && typeof projection.invert === 'function') {
      // test for real if within the bounds
      const longlat = projection.invert([mouseX, mouseY]);
      return longlat && geoContains(this.feature, longlat);
    }

    return r;
  }

  inXRange(mouseX) {
    return this.inRange(mouseX, Number.NaN);
  }

  inYRange(mouseY) {
    return this.inRange(Number.NaN, mouseY);
  }

  getCenterPoint() {
    if (this.cache && this.cache.center) {
      return this.cache.center;
    }
    const centroid = this.projectionScale.geoPath.centroid(this.feature);
    const center = {
      x: centroid[0],
      y: centroid[1],
    };
    this.cache = Object.assign({}, this.cache || {}, { center });
    return center;
  }

  getBounds() {
    if (this.cache && this.cache.bounds) {
      return this.cache.bounds;
    }
    const bb = this.projectionScale.geoPath.bounds(this.feature);
    const bounds = {
      x: bb[0][0],
      x2: bb[1][0],
      y: bb[0][1],
      y2: bb[1][1],
      width: bb[1][0] - bb[0][0],
      height: bb[1][1] - bb[0][1],
    };
    this.cache = Object.assign({}, this.cache || {}, { bounds });
    return bounds;
  }

  tooltipPosition() {
    return this.getCenterPoint();
  }

  _drawInCache(doc) {
    const bounds = this.getBounds();
    if (!Number.isFinite(bounds.x)) {
      return;
    }
    const canvas = this.cache && this.cache.canvas ? this.cache.canvas : doc.createElement('canvas');
    canvas.width = Math.max(Math.ceil(bounds.width), 1);
    canvas.height = Math.max(Math.ceil(bounds.height), 1);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-bounds.x, -bounds.y);
    this._drawImpl(ctx);
    ctx.restore();

    this.cache = Object.assign({}, this.cache || {}, {
      canvas,
      canvasKey: this._optionsToKey(),
    });
  }

  _optionsToKey() {
    const options = this.options;
    return `${options.backgroundColor};${options.borderColor};${options.borderWidth}`;
  }

  _drawImpl(ctx) {
    const options = this.options;
    ctx.beginPath();
    this.projectionScale.geoPath.context(ctx)(this.feature);
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fill();
    }
    if (options.borderColor) {
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.stroke();
    }
  }

  draw(ctx) {
    if (!this.feature) {
      return;
    }
    if (!this.cache || this.cache.canvasKey !== this._optionsToKey()) {
      this._drawInCache(ctx.canvas.ownerDocument);
    }
    const bounds = this.getBounds();
    if (this.cache && this.cache.canvas) {
      ctx.drawImage(this.cache.canvas, bounds.x, bounds.y, bounds.width, bounds.height);
    } else if (Number.isFinite(bounds.x)) {
      ctx.save();
      this._drawImpl(ctx);
      ctx.restore();
    }
  }
}

GeoFeature.id = 'geoFeature';
GeoFeature.defaults = /*#__PURE__*/ Object.assign({}, Rectangle.defaults, {
  outlineBackgroundColor: null,
  outlineBorderWidth: 0,

  graticuleBorderColor: '#CCCCCC',
  graticuleBorderWidth: 0,
});
GeoFeature.defaultRoutes = Object.assign(
  {
    outlineBorderColor: 'color',
  },
  Rectangle.defaultRoutes || {}
);

const lookup = {
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoGnomonic,
  geoOrthographic,
  geoStereographic,
  geoEqualEarth,
  geoAlbers,
  geoAlbersUsa,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEquirectangular,
  geoMercator,
  geoTransverseMercator,
  geoNaturalEarth1,
};
Object.keys(lookup).forEach((key) => {
  lookup[`${key.charAt(3).toLowerCase()}${key.slice(4)}`] = lookup[key];
});

class ProjectionScale extends Scale {
  constructor(cfg) {
    super(cfg);
    this.geoPath = geoPath();
  }

  init(options) {
    options.position = 'chartArea';
    super.init(options);
    if (typeof this.options.projection === 'string' && typeof lookup[this.options.projection] === 'function') {
      this.projection = lookup[this.options.projection]();
    } else {
      this.projection = this.options.projection;
    }
    this.geoPath.projection(this.projection);
  }

  computeBounds(outline) {
    const bb = geoPath(this.projection.fitWidth(1000, outline)).bounds(outline);
    const bHeight = Math.ceil(bb[1][1] - bb[0][1]);
    const bWidth = Math.ceil(bb[1][0] - bb[0][0]);
    const t = this.projection.translate();

    this.outlineBounds = {
      width: bWidth,
      height: bHeight,
      aspectRatio: bWidth / bHeight,
      refScale: this.projection.scale(),
      refX: t[0],
      refY: t[1],
    };
  }

  updateBounds() {
    const area = this.chart.chartArea;
    const bb = this.outlineBounds;

    const chartWidth = area.right - area.left;
    const chartHeight = area.bottom - area.top;

    const bak = this.oldChartBounds;
    this.oldChartBounds = {
      chartWidth,
      chartHeight,
    };

    const scale = Math.min(chartWidth / bb.width, chartHeight / bb.height);
    const viewWidth = bb.width * scale;
    const viewHeight = bb.height * scale;

    const x = (chartWidth - viewWidth) * 0.5;
    const y = (chartHeight - viewHeight) * 0.5;

    // this.mapScale = scale;
    // this.mapTranslate = {x, y};

    this.projection.scale(bb.refScale * scale).translate([scale * bb.refX + x, scale * bb.refY + y]);

    return (
      !bak || bak.chartWidth !== this.oldChartBounds.chartWidth || bak.chartHeight !== this.oldChartBounds.chartHeight
    );
  }
}
ProjectionScale.id = 'projection';
ProjectionScale.defaults = {
  projection: 'albersUsa',
};

const baseDefaults = {
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

function BaseMixin(superClass) {
  return class extends superClass {
    init(options) {
      options.position = 'chartArea';
      super.init(options);
      this.axis = 'r';
    }

    parse(raw, index) {
      if (raw && typeof raw[this.options.property] === 'number') {
        return raw[this.options.property];
      }
      return super.parse(raw, index);
    }

    isHorizontal() {
      return this.options.legend.align === 'top' || this.options.legend.align === 'bottom';
    }

    _getNormalizedValue(v) {
      if (v == null || Number.isNaN(v)) {
        return null;
      }
      return (v - this._startValue) / this._valueRange;
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
    }

    update(maxWidth, maxHeight, margins) {
      const ch = Math.min(maxHeight, this.bottom == null ? Number.POSITIVE_INFINITY : this.bottom);
      const cw = Math.min(maxWidth, this.right == null ? Number.POSITIVE_INFINITY : this.right);

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
      super.update(w, h, margins);
      this.options.position = bak;
      this.height = Math.min(h, this.height);
      this.width = Math.min(w, this.width);
    }

    draw(chartArea) {
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
      super.draw(
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
    }
  };
}

const lookup$1 = {
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

Object.keys(lookup$1).forEach((key) => {
  lookup$1[`${key.charAt(11).toLowerCase()}${key.slice(12)}`] = lookup$1[key];
  lookup$1[key.slice(11)] = lookup$1[key];
});

function quantize(v, steps) {
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

function ColorScaleMixin(superClass) {
  return class extends BaseMixin(superClass) {
    init(options) {
      super.init(options);
      if (typeof this.options.interpolate === 'string' && typeof lookup$1[this.options.interpolate] === 'function') {
        this.interpolate = lookup$1[this.options.interpolate];
      } else {
        this.interpolate = this.options.interpolate;
      }
    }
    getColorForValue(value) {
      const v = this._getNormalizedValue(value);
      if (v == null || Number.isNaN(v)) {
        return this.options.missing;
      }
      return this.getColor(v);
    }
    getColor(normalized) {
      let v = normalized;
      if (this.options.quantize > 0) {
        v = quantize(v, this.options.quantize);
      }
      return this.interpolate(v);
    }

    _drawIndicator() {
      /** @type {CanvasRenderingContext2D} */
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const indicatorSize = this.options.legend.indicatorWidth;
      const reverse = this._reversePixels;

      if (this.isHorizontal()) {
        if (this.options.quantize > 0) {
          const stepWidth = w / this.options.quantize;
          const offset = !reverse ? (i) => i : (i) => w - stepWidth - i;
          for (let i = 0; i < w; i += stepWidth) {
            const v = (i + stepWidth / 2) / w;
            ctx.fillStyle = this.getColor(v);
            ctx.fillRect(offset(i), 0, stepWidth, indicatorSize);
          }
        } else {
          const offset = !reverse ? (i) => i : (i) => w - 1 - i;
          for (let i = 0; i < w; ++i) {
            ctx.fillStyle = this.getColor((i + 0.5) / w);
            ctx.fillRect(offset(i), 0, 1, indicatorSize);
          }
        }
      } else if (this.options.quantize > 0) {
        const stepWidth = h / this.options.quantize;
        const offset = !reverse ? (i) => i : (i) => h - stepWidth - i;
        for (let i = 0; i < h; i += stepWidth) {
          const v = (i + stepWidth / 2) / h;
          ctx.fillStyle = this.getColor(v);
          ctx.fillRect(0, offset(i), indicatorSize, stepWidth);
        }
      } else {
        const offset = !reverse ? (i) => i : (i) => h - 1 - i;
        for (let i = 0; i < h; ++i) {
          ctx.fillStyle = this.getColor((i + 0.5) / h);
          ctx.fillRect(0, offset(i), indicatorSize, 1);
        }
      }
    }
  };
}
class ColorScale extends ColorScaleMixin(LinearScale) {}

const colorScaleDefaults = {
  interpolate: 'blues',
  missing: 'transparent',
  quantize: 0,
};
ColorScale.id = 'color';
ColorScale.defaults = /*#__PURE__*/ merge({}, [LinearScale.defaults, baseDefaults, colorScaleDefaults]);

class ColorLogarithmicScale extends ColorScaleMixin(LogarithmicScale) {
  _getNormalizedValue(v) {
    if (v == null || Number.isNaN(v)) {
      return null;
    }
    return (Math.log10(v) - this._startValue) / this._valueRange;
  }
}

ColorLogarithmicScale.id = 'colorLogarithmic';
ColorLogarithmicScale.defaults = /*#__PURE__*/ merge({}, [LogarithmicScale.defaults, baseDefaults, colorScaleDefaults]);

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
        const renderOptions = Object.assign({}, this._model || {}, {
          radius,
        });
        drawPoint(ctx, renderOptions, x, y);
      });
    }
  };
}

class SizeScale extends SizeSaleMixin(LinearScale) {}

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
SizeScale.defaults = /*#__PURE__*/ merge({}, [LinearScale.defaults, baseDefaults, scaleDefaults]);

class SizeLogarithmicScale extends SizeSaleMixin(LogarithmicScale) {
  _getNormalizedValue(v) {
    if (v == null || Number.isNaN(v)) {
      return null;
    }
    return (Math.log10(v) - this._startValue) / this._valueRange;
  }
}

SizeLogarithmicScale.id = 'sizeLogarithmic';
SizeLogarithmicScale.defaults = /*#__PURE__*/ merge({}, [LogarithmicScale.defaults, baseDefaults, scaleDefaults]);

const geoDefaults = {
  datasetElementOptions: [
    'outlineBackgroundColor',
    'outlineBorderColor',
    'outlineBorderWidth',
    'graticuleBorderColor',
    'graticuleBorderWidth',
  ],
  showOutline: false,
  showGraticule: false,
  clipMap: true,
  scales: {
    xy: {
      type: ProjectionScale.id,
      position: 'chartArea',
      display: false,
    },
  },
};

function patchDatasetElementOptions(options) {
  // patch the options by removing the `outline` or `hoverOutline` option;
  // see https://github.com/chartjs/Chart.js/issues/7362
  const r = {};
  Object.keys(options).forEach((key) => {
    let targetKey = key;
    if (key.startsWith('outline')) {
      const sub = key.slice('outline'.length);
      targetKey = sub[0].toLowerCase() + sub.slice(1);
    } else if (key.startsWith('hoverOutline')) {
      targetKey = 'hover' + key.slice('hoverOutline'.length);
    }
    r[targetKey] = options[key];
  });
  return r;
}

class GeoController extends DatasetController {
  getProjectionScale() {
    return this.getScaleForId('xy');
  }

  linkScales() {
    const dataset = this.getDataset();
    const meta = this.getMeta();
    meta.xAxisID = dataset.xAxisID = 'xy';
    meta.yAxisID = dataset.yAxisID = 'xy';
    meta.xScale = this.getScaleForId('xy');
    meta.yScale = this.getScaleForId('xy');

    this.getProjectionScale().computeBounds(this.resolveOutline());
  }

  showOutline() {
    return valueOrDefault(this.getDataset().showOutline, this.chart.options.showOutline);
  }

  clipMap() {
    return valueOrDefault(this.getDataset().clipMap, this.chart.options.clipMap);
  }

  getGraticule() {
    return valueOrDefault(this.getDataset().showGraticule, this.chart.options.showGraticule);
  }

  update(mode) {
    super.update(mode);

    const active = mode === 'active';
    const meta = this.getMeta();

    const scale = this.getProjectionScale();
    const dirtyCache = scale.updateBounds();

    if (this.showOutline()) {
      const elem = meta.dataset;
      if (dirtyCache) {
        delete elem.cache;
      }
      elem.projectionScale = scale;
      if (mode !== 'resize') {
        const properties = {
          feature: this.resolveOutline(),
          options: patchDatasetElementOptions(this.resolveDatasetElementOptions(active)),
        };
        this.updateElement(elem, undefined, properties, mode);
        if (this.getGraticule()) {
          meta.graticule = properties.options;
        }
      }
    } else if (this.getGraticule() && mode !== 'resize') {
      meta.graticule = patchDatasetElementOptions(this.resolveDatasetElementOptions(active));
    }

    this.updateElements(meta.data, 0, mode);
    if (dirtyCache) {
      meta.data.forEach((elem) => delete elem.cache);
    }
  }

  resolveOutline() {
    const ds = this.getDataset();
    const outline = ds.outline || { type: 'Sphere' };
    if (Array.isArray(outline)) {
      return {
        type: 'FeatureCollection',
        features: outline,
      };
    }
    return outline;
  }

  showGraticule() {
    const g = this.getGraticule();
    if (!g) {
      return;
    }
    const ctx = this.chart.ctx;
    const scale = this.getProjectionScale();
    const path = scale.geoPath.context(ctx);

    ctx.save();
    ctx.beginPath();

    if (g === true) {
      path(geoGraticule10());
    } else {
      const geo = geoGraticule();
      if (g.stepMajor) {
        geo.stepMajor(g.stepMajor);
      }
      if (g.stepMinor) {
        geo.stepMinor(g.stepMinor);
      }
      path(geo);
    }

    const options = this.getMeta().graticule;
    ctx.strokeStyle = options.graticuleBorderColor;
    ctx.lineWidth = options.graticuleBorderWidth;
    ctx.stroke();
    ctx.restore();
  }

  draw() {
    const chart = this.chart;

    const clipMap = this.clipMap();

    // enable clipping based on the option
    let enabled = false;
    if (clipMap === true || clipMap === 'outline' || clipMap === 'outline+graticule') {
      enabled = true;
      clipArea(chart.ctx, chart.chartArea);
    }

    if (this.showOutline()) {
      this.getMeta().dataset.draw(chart.ctx);
    }

    if (clipMap === true || clipMap === 'graticule' || clipMap === 'outline+graticule') {
      if (!enabled) {
        clipArea(chart.ctx, chart.chartArea);
      }
    } else if (enabled) {
      enabled = false;
      unclipArea(chart.ctx);
    }

    this.showGraticule();

    if (clipMap === true || clipMap === 'items') {
      if (!enabled) {
        clipArea(chart.ctx, chart.chartArea);
      }
    } else if (enabled) {
      enabled = false;
      unclipArea(chart.ctx);
    }

    this.getMeta().data.forEach((elem) => elem.draw(chart.ctx));

    if (enabled) {
      enabled = false;
      unclipArea(chart.ctx);
    }
  }
}

function patchController(config, controller, elements = [], scales = []) {
  registry.addControllers(controller);
  registry.addElements(elements);
  registry.addScales(scales);
  config.type = controller.id;
  return config;
}

class ChoroplethController extends GeoController {
  linkScales() {
    super.linkScales();
    const dataset = this.getDataset();
    const meta = this.getMeta();
    meta.vAxisID = meta.rAxisID = 'color';
    dataset.vAxisID = dataset.rAxisID = 'color';
    meta.rScale = this.getScaleForId('color');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID;
  }

  parse(start, count) {
    const rScale = this.getMeta().rScale;
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; ++i) {
      meta._parsed[i] = {
        [rScale.axis]: rScale.parse(data[i]),
      };
    }
  }

  updateElements(elems, start, mode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode, elems[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();

    for (let i = 0; i < elems.length; i++) {
      const index = start + i;
      const elem = elems[i];
      elem.projectionScale = scale;
      elem.feature = this._data[i].feature;
      const center = elem.getCenterPoint();

      const properties = {
        x: center.x,
        y: center.y,
      };
      if (includeOptions) {
        properties.options = this.resolveDataElementOptions(index, mode);
      }
      this.updateElement(elem, index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode);
  }

  indexToColor(index) {
    const rScale = this.getMeta().rScale;
    return rScale.getColorForValue(this.getParsed(index)[rScale.axis]);
  }
}

ChoroplethController.id = 'choropleth';
ChoroplethController.defaults = /*#__PURE__*/ merge({}, [
  geoDefaults,
  {
    datasetElementType: GeoFeature.id,
    dataElementType: GeoFeature.id,
    dataElementOptions: ['backgroundColor', 'borderColor', 'borderWidth'],
    tooltips: {
      callbacks: {
        title() {
          // Title doesn't make sense for scatter since we format the data as a point
          return '';
        },
        label(item) {
          if (item.formattedValue == null) {
            return item.chart.data.labels[item.dataIndex];
          }
          return `${item.chart.data.labels[item.dataIndex]}: ${item.formattedValue}`;
        },
      },
    },
    scales: {
      color: {
        type: ColorScale.id,
      },
    },
    elements: {
      geoFeature: {
        backgroundColor(context) {
          if (context.dataIndex == null) {
            return null;
          }
          const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
          return controller.indexToColor(context.dataIndex);
        },
      },
    },
  },
]);

class ChoroplethChart extends Chart {
  constructor(item, config) {
    super(item, patchController(config, ChoroplethController, GeoFeature, [ColorScale, ProjectionScale]));
  }
}
ChoroplethChart.id = ChoroplethController.id;

class BubbleMapController extends GeoController {
  linkScales() {
    super.linkScales();
    const dataset = this.getDataset();
    const meta = this.getMeta();
    meta.vAxisID = meta.rAxisID = 'r';
    dataset.vAxisID = dataset.rAxisID = 'r';
    meta.rScale = this.getScaleForId('r');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID;
  }

  parse(start, count) {
    const rScale = this.getMeta().rScale;
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; ++i) {
      const d = data[i];
      meta._parsed[i] = {
        x: d.longitude == null ? d.x : d.longitude,
        y: d.latitude == null ? d.y : d.latitude,
        [rScale.axis]: rScale.parse(d),
      };
    }
  }

  updateElements(elems, start, mode) {
    const reset = mode === 'reset';
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode, elems[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();

    this.getMeta().rScale._model = firstOpts; // for legend rendering styling

    for (let i = 0; i < elems.length; i++) {
      const index = start + i;
      const elem = elems[i];
      const parsed = this.getParsed(i);
      const xy = scale.projection([parsed.x, parsed.y]);
      const properties = {
        x: xy ? xy[0] : 0,
        y: xy ? xy[1] : 0,
        skip: Number.isNaN(parsed.x) || Number.isNaN(parsed.y),
      };
      if (includeOptions) {
        properties.options = this.resolveDataElementOptions(index, mode);
        if (reset) {
          properties.options.radius = 0;
        }
      }
      this.updateElement(elem, index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode);
  }

  indexToRadius(index) {
    const rScale = this.getMeta().rScale;
    return rScale.getSizeForValue(this.getParsed(index)[rScale.axis]);
  }
}

BubbleMapController.id = 'bubbleMap';
BubbleMapController.defaults = merge({}, [
  geoDefaults,
  {
    dataElementType: Point.id,
    dataElementOptions: BubbleController.defaults.dataElementOptions,
    datasetElementType: GeoFeature.id,
    showOutline: true,
    clipMap: 'outline+graticule',
    tooltips: {
      callbacks: {
        title() {
          // Title doesn't make sense for scatter since we format the data as a point
          return '';
        },
        label(item) {
          if (item.formattedValue == null) {
            return item.chart.data.labels[item.dataIndex];
          }
          return `${item.chart.data.labels[item.dataIndex]}: ${item.formattedValue}`;
        },
      },
    },
    scales: {
      r: {
        type: SizeScale.id,
      },
    },
    elements: {
      point: {
        radius(context) {
          if (context.dataIndex == null) {
            return null;
          }
          const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
          return controller.indexToRadius(context.dataIndex);
        },
        hoverRadius: undefined,
      },
    },
  },
]);

class BubbleMapChart extends Chart {
  constructor(item, config) {
    super(item, patchController(config, BubbleMapController, GeoFeature, [SizeScale, ProjectionScale]));
  }
}
BubbleMapChart.id = BubbleMapController.id;

const topojson = t;

export { BubbleMapChart, BubbleMapController, ChoroplethChart, ChoroplethController, ColorLogarithmicScale, ColorScale, GeoController, GeoFeature, ProjectionScale, SizeLogarithmicScale, SizeScale, geoDefaults, topojson };
