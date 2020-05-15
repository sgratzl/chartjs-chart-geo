import { DatasetController, helpers } from 'chart.js';
import { geoGraticule, geoGraticule10 } from 'd3-geo';
import { GeoFeature } from '../elements';

export const geoDefaults = {
  showOutline: false,
  showGraticule: false,
  clipMap: true,
  animation: false,
  scales: {
    xy: {
      type: 'projection',
      position: 'chartArea',
      display: false,
    },
  },
};

export class Geo extends DatasetController {
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
    return helpers.valueOrDefault(this.getDataset().showOutline, this.chart.options.showOutline);
  }

  clipMap() {
    return helpers.valueOrDefault(this.getDataset().clipMap, this.chart.options.clipMap);
  }

  getGraticule() {
    return helpers.valueOrDefault(this.getDataset().showGraticule, this.chart.options.showGraticule);
  }

  update(mode) {
    super.update(mode);

    const active = mode === 'active';
    const meta = this.getMeta();

    const dirtyCache = this.getProjectionScale().updateBounds();

    if (this.showOutline()) {
      const elem = meta.dataset;
      if (dirtyCache) {
        delete elem.cache;
      }
      if (mode !== 'resize') {
        const properties = {
          feature: this.resolveOutline(),
          options: this.resolveDatasetElementOptions(active),
        };
        this.updateElement(elem, undefined, properties, mode);
        if (this.getGraticule()) {
          meta.graticule = properties.options;
        }
      }
    } else if (this.getGraticule() && mode !== 'resize') {
      meta.graticule = this.resolveDatasetElementOptions(active);
    }

    this.updateElements(meta.data, 0, mode);
    if (dirtyCache) {
      meta.data.forEach((elem) => delete elem.cache);
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
    const path = this.getProjectionScale().geoPath.context(ctx);

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
      helpers.canvas.clipArea(chart.ctx, chart.chartArea);
    }

    if (this.showOutline()) {
      this.getMeta().dataset.draw(chart.ctx);
    }

    if (clipMap === true || clipMap === 'graticule' || clipMap === 'outline+graticule') {
      if (!enabled) {
        helpers.canvas.clipArea(chart.ctx, chart.chartArea);
      }
    } else if (enabled) {
      enabled = false;
      helpers.canvas.unclipArea(chart.ctx);
    }

    this.showGraticule();

    if (clipMap === true || clipMap === 'items') {
      if (!enabled) {
        helpers.canvas.clipArea(chart.ctx, chart.chartArea);
      }
    } else if (enabled) {
      enabled = false;
      helpers.canvas.unclipArea(chart.ctx);
    }

    this.getMeta().data.forEach((elem) => elem.draw(chart.ctx));

    if (enabled) {
      enabled = false;
      helpers.canvas.unclipArea(chart.ctx);
    }
  }
}

Geo.prototype.datasetElementType = GeoFeature;
Geo.prototype.datasetElementOptions = {
  backgroundColor: 'outlineBackgroundColor',
  borderColor: 'outlineBorderColor',
  borderWidth: 'outlineBorderWidth',
  graticuleBorderColor: 'graticuleBorderColor',
  graticuleBorderWidth: 'graticuleBorderWidth',
};
