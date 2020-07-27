import {
  DatasetController,
  clipArea,
  unclipArea,
  valueOrDefault,
  IChartDataset,
  ScriptableAndArrayOptions,
  UpdateMode,
  Element,
  IVisualElement,
} from '@sgratzl/chartjs-esm-facade';
import { geoGraticule, geoGraticule10, ExtendedFeature } from 'd3-geo';
import { ProjectionScale, IProjectionScaleType } from '../scales';
import { GeoFeature, IGeoFeatureOptions } from '../elements';

export const geoDefaults = {
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

function patchDatasetElementOptions(options: any) {
  // patch the options by removing the `outline` or `hoverOutline` option;
  // see https://github.com/chartjs/Chart.js/issues/7362
  const r: any = {};
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

export class GeoController<E extends Element & IVisualElement> extends DatasetController<E, GeoFeature> {
  getGeoDataset() {
    return (super.getDataset() as unknown) as IChartDataset<any, IGeoControllerDatasetOptions>;
  }
  getGeoOptions() {
    return (this.chart.options as unknown) as IGeoChartOptions;
  }
  getProjectionScale() {
    return this.getScaleForId('xy') as ProjectionScale;
  }

  linkScales() {
    const dataset = this.getGeoDataset();
    const meta = this.getMeta();
    meta.xAxisID = dataset.xAxisID = 'xy';
    meta.yAxisID = dataset.yAxisID = 'xy';
    meta.xScale = this.getScaleForId('xy');
    meta.yScale = this.getScaleForId('xy');

    this.getProjectionScale().computeBounds(this.resolveOutline());
  }

  showOutline() {
    return valueOrDefault(this.getGeoDataset().showOutline, this.getGeoOptions().showOutline);
  }

  clipMap() {
    return valueOrDefault(this.getGeoDataset().clipMap, this.getGeoOptions().clipMap);
  }

  getGraticule() {
    return valueOrDefault(this.getGeoDataset().showGraticule, this.getGeoOptions().showGraticule);
  }

  update(mode: UpdateMode) {
    super.update(mode);

    const active = mode === 'active';
    const meta = this.getMeta();

    const scale = this.getProjectionScale();
    const dirtyCache = scale.updateBounds();

    if (this.showOutline()) {
      const elem = meta.dataset!;
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
          (meta as any).graticule = properties.options;
        }
      }
    } else if (this.getGraticule() && mode !== 'resize') {
      (meta as any).graticule = patchDatasetElementOptions(this.resolveDatasetElementOptions(active));
    }

    this.updateElements(meta.data, 0, mode);
    if (dirtyCache) {
      meta.data.forEach((elem) => delete (elem as any).cache);
    }
  }

  resolveOutline(): any {
    const ds = this.getGeoDataset();
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

    if (typeof g === 'boolean') {
      if (g) {
        path(geoGraticule10());
      }
    } else {
      const geo = geoGraticule();
      if (g.stepMajor) {
        geo.stepMajor((g.stepMajor as unknown) as [number, number]);
      }
      if (g.stepMinor) {
        geo.stepMinor((g.stepMinor as unknown) as [number, number]);
      }
      path(geo());
    }

    const options = (this.getMeta() as any).graticule;
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
      this.getMeta().dataset!.draw(chart.ctx);
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

export interface IGeoChartOptions {
  /**
   * Outline used to scale and centralize the projection in the chart area.
   * By default a sphere is used
   * @default { type: 'Sphere" }
   */
  outline: any[];
  /**
   * option to render the outline in the background, see also the outline... styling option
   * @default false
   */
  showOutline: boolean;

  /**
   * option to render a graticule in the background, see also the outline... styling option
   * @default false
   */
  showGraticule:
    | boolean
    | {
        stepMajor: [number, number];
        stepMinor: [number, number];
      };

  /**
   * option whether to clip the rendering to the chartArea of the graph
   * @default choropleth: true bubbleMap: 'outline+graticule'
   */
  clipMap: boolean | 'outline' | 'graticule' | 'outline+graticule' | 'items';
}

export interface IGeoControllerDatasetOptions extends IGeoChartOptions, ScriptableAndArrayOptions<IGeoFeatureOptions> {
  xAxisID?: string;
  yAxisID?: string;
  rAxisID?: string;
  iAxisID?: string;
  vAxisID?: string;
}

export interface IGeoDataPoint {
  feature: ExtendedFeature;
}
