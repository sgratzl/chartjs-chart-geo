import { DatasetController, clipArea, unclipArea, valueOrDefault } from '../chart';
import { geoGraticule, geoGraticule10 } from 'd3-geo';
import { ProjectionScale } from '../scales';

export function geoDefaults() {
  return {
    showOutline: false,
    showGraticule: false,
    clipMap: true,
    scales: {
      xy: {
        type: ProjectionScale.register().id,
        position: 'chartArea',
        display: false,
      },
    },
  };
}

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

export class GeoController extends DatasetController {
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

// Geo.prototype.datasetElementType = GeoFeature.register();
GeoController.prototype.datasetElementOptions = [
  'outlineBackgroundColor',
  'outlineBorderColor',
  'outlineBorderWidth',
  'graticuleBorderColor',
  'graticuleBorderWidth',
];
