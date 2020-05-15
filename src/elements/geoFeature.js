import { defaults, Element } from 'chart.js';
import { geoContains } from 'd3-geo';

defaults.set('elements', {
  geoFeature: Object.assign({}, defaults.elements.rectangle, {
    outlineBackgroundColor: null,
    outlineBorderColor: defaults.color,
    outlineBorderWidth: 0,

    graticuleBorderColor: '#CCCCCC',
    graticuleBorderWidth: 0,
  }),
});

export class GeoFeature extends Element {
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

  inLabelRange(mouseX, mouseY) {
    return this.inRange(mouseX, mouseY);
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

  getArea() {
    if (this.cache && this.cache.area) {
      return this.cache.area;
    }
    const area = this.projectionScale.geoPath.area(this.feature);

    this.cache = Object.assign({}, this.cache || {}, { area });
    return area;
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
GeoFeature._type = 'geoFeature';
