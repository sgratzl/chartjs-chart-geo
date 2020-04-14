import * as Chart from 'chart.js';
import { geoGraticule, geoGraticule10 } from 'd3-geo';

const defaults = {
  showOutline: false,
  showGraticule: false,
  clipMap: true,
  animation: false,
  scale: {
    type: 'projection',
    id: 'scale',
    display: false,
  },
};

export const geoDefaults = Chart.helpers.configMerge(Chart.defaults.global, defaults);

const superClass = Chart.DatasetController.prototype;
export const Geo = Chart.DatasetController.extend({
  datasetElementType: Chart.elements.GeoFeature,

  getProjectionScale() {
    return this.getScaleForId('scale');
  },

  linkScales() {
    const meta = this.getMeta();
    meta.xAxisID = 'scale';
    meta.yAxisID = 'scale';

    this.getProjectionScale().computeBounds(this.resolveOutline());
  },

  showOutline() {
    return Chart.helpers.valueOrDefault(this.getDataset().showOutline, this.chart.options.showOutline);
  },

  clipMap() {
    return Chart.helpers.valueOrDefault(this.getDataset().clipMap, this.chart.options.clipMap);
  },

  getGraticule() {
    return Chart.helpers.valueOrDefault(this.getDataset().showGraticule, this.chart.options.showGraticule);
  },

  update(reset) {
    superClass.update.call(this, reset);

    const dirtyCache = this.getProjectionScale().updateBounds();

    if (this.showOutline()) {
      const elem = this.getMeta().dataset;
      this.updateGeoFeatureElement(elem, -1, reset);
      if (dirtyCache) {
        delete elem.cache;
      }
    }

    if (this.getGraticule()) {
      this.getMeta().graticule = this.resolveGeoFeatureOptions({}, -1, reset);
    }

    this.getMeta().data.forEach((elem, i) => {
      this.updateElement(elem, i, reset);
      if (dirtyCache) {
        delete elem.cache;
      }
    });
  },

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
  },

  updateElement() {
    // no op
  },

  updateGeoFeatureElement(elem, index, reset) {
    const ds = this.getDataset();
    const meta = this.getMeta();

    elem.feature = index < 0 ? this.resolveOutline() : ds.data[index].feature;

    elem._xScale = this.getScaleForId(meta.xAxisID);
    elem._yScale = this.getScaleForId(meta.yAxisID);
    elem._datasetIndex = this.index;
    elem._index = index;
    elem._model = this.resolveGeoFeatureOptions(elem, index, reset);
    const center = elem.getCenterPoint();
    elem._model.x = center.x;
    elem._model.y = center.y;

    elem.pivot();
  },

  resolveGeoFeatureOptions(elem, index, reset) {
    const chart = this.chart;
    const dataset = this.getDataset();
    const custom = elem.custom || {};
    const options = chart.options.elements.geoFeature;

    // Scriptable options
    const context = {
      chart: chart,
      dataIndex: index,
      dataset: dataset,
      datasetIndex: this.index,
      reset,
    };

    const keys = [
      'backgroundColor',
      'borderColor',
      'borderWidth',
      'hoverBackgroundColor',
      'hoverBorderColor',
      'hoverBorderWidth',
    ];

    const values = {};

    keys.forEach((key) => {
      let arr;
      if (index < 0) {
        // outline
        const outlineKey = `outline${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        arr = [custom[outlineKey], dataset[outlineKey], options[outlineKey]];
      } else {
        arr = [custom[key], dataset[key], options[key]];
      }
      values[key] = Chart.helpers.options.resolve(arr, context, index);
    });

    return values;
  },

  transition(easingValue) {
    superClass.transition.call(this, easingValue);
  },

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

    const vm = this.getMeta().graticule;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = vm.borderWidth;
    ctx.stroke();
    ctx.restore();
  },

  draw() {
    const chart = this.chart;

    const clipMap = this.clipMap();

    // enable clipping based on the option
    let enabled = false;
    if (clipMap === true || clipMap === 'outline' || clipMap === 'outline+graticule') {
      enabled = true;
      Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);
    }

    if (this.showOutline()) {
      this.getMeta().dataset.draw();
    }

    if (clipMap === true || clipMap === 'graticule' || clipMap === 'outline+graticule') {
      if (!enabled) {
        Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);
      }
    } else if (enabled) {
      enabled = false;
      Chart.helpers.canvas.unclipArea(chart.ctx);
    }

    this.showGraticule();

    if (clipMap === true || clipMap === 'items') {
      if (!enabled) {
        Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);
      }
    } else if (enabled) {
      enabled = false;
      Chart.helpers.canvas.unclipArea(chart.ctx);
    }

    this.getMeta().data.forEach((elem) => elem.draw());

    if (enabled) {
      enabled = false;
      Chart.helpers.canvas.unclipArea(chart.ctx);
    }
  },
});
