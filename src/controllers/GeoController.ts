import {
  DatasetController,
  ChartDataset,
  ScriptableAndArrayOptions,
  UpdateMode,
  Element,
  VisualElement,
  ScriptableContext,
  ChartTypeRegistry,
  AnimationOptions,
} from 'chart.js';
import { clipArea, unclipArea, valueOrDefault } from 'chart.js/helpers';
import { geoGraticule, geoGraticule10, ExtendedFeature } from 'd3-geo';
import { ProjectionScale } from '../scales';
import type { GeoFeature, IGeoFeatureOptions } from '../elements';

export const geoDefaults = {
  showOutline: false,
  showGraticule: false,
  clipMap: true,
};

export const geoOverrides = {
  scales: {
    projection: {
      axis: 'x',
      type: ProjectionScale.id,
      position: 'chartArea',
      display: false,
    },
  },
};

function patchDatasetElementOptions(options: any) {
  // patch the options by removing the `outline` or `hoverOutline` option;
  // see https://github.com/chartjs/Chart.js/issues/7362
  const r: any = { ...options };
  Object.keys(options).forEach((key) => {
    let targetKey = key;
    if (key.startsWith('outline')) {
      const sub = key.slice('outline'.length);
      targetKey = sub[0].toLowerCase() + sub.slice(1);
    } else if (key.startsWith('hoverOutline')) {
      targetKey = `hover${key.slice('hoverOutline'.length)}`;
    } else {
      return;
    }
    delete r[key];
    r[targetKey] = options[key];
  });
  return r;
}

export class GeoController<
  TYPE extends keyof ChartTypeRegistry,
  TElement extends Element & VisualElement
> extends DatasetController<TYPE, TElement, GeoFeature> {
  getGeoDataset(): ChartDataset<'choropleth' | 'bubbleMap'> & IGeoControllerDatasetOptions {
    return super.getDataset() as unknown as ChartDataset<'choropleth' | 'bubbleMap'> & IGeoControllerDatasetOptions;
  }

  getGeoOptions(): IGeoChartOptions {
    return this.chart.options as unknown as IGeoChartOptions;
  }

  getProjectionScale(): ProjectionScale {
    return this.getScaleForId('projection') as ProjectionScale;
  }

  linkScales(): void {
    const dataset = this.getGeoDataset();
    const meta = this.getMeta();
    meta.xAxisID = 'projection';
    dataset.xAxisID = 'projection';
    meta.yAxisID = 'projection';
    dataset.yAxisID = 'projection';
    meta.xScale = this.getScaleForId('projection');
    meta.yScale = this.getScaleForId('projection');

    this.getProjectionScale().computeBounds(this.resolveOutline());
  }

  showOutline(): IGeoChartOptions['showOutline'] {
    return valueOrDefault(this.getGeoDataset().showOutline, this.getGeoOptions().showOutline);
  }

  clipMap(): IGeoChartOptions['clipMap'] {
    return valueOrDefault(this.getGeoDataset().clipMap, this.getGeoOptions().clipMap);
  }

  getGraticule(): IGeoChartOptions['showGraticule'] {
    return valueOrDefault(this.getGeoDataset().showGraticule, this.getGeoOptions().showGraticule);
  }

  update(mode: UpdateMode): void {
    super.update(mode);

    const meta = this.getMeta();

    const scale = this.getProjectionScale();
    const dirtyCache = scale.updateBounds();

    if (this.showOutline()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const elem = meta.dataset!;
      if (dirtyCache) {
        delete elem.cache;
      }
      elem.projectionScale = scale;
      elem.pixelRatio = this.chart.currentDevicePixelRatio;
      if (mode !== 'resize') {
        const options = patchDatasetElementOptions(this.resolveDatasetElementOptions(mode));
        const properties = {
          feature: this.resolveOutline(),
          options,
        };
        this.updateElement(elem, undefined, properties, mode);
        if (this.getGraticule()) {
          (meta as any).graticule = options;
        }
      }
    } else if (this.getGraticule() && mode !== 'resize') {
      (meta as any).graticule = patchDatasetElementOptions(this.resolveDatasetElementOptions(mode));
    }

    this.updateElements(meta.data, 0, meta.data.length, mode);
    if (dirtyCache) {
      // eslint-disable-next-line no-param-reassign
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

  showGraticule(): void {
    const g = this.getGraticule();
    const options = (this.getMeta() as any).graticule;
    if (!g || !options) {
      return;
    }
    const { ctx } = this.chart;
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
        geo.stepMajor(g.stepMajor as unknown as [number, number]);
      }
      if (g.stepMinor) {
        geo.stepMinor(g.stepMinor as unknown as [number, number]);
      }
      path(geo());
    }

    ctx.strokeStyle = options.graticuleBorderColor;
    ctx.lineWidth = options.graticuleBorderWidth;
    ctx.stroke();
    ctx.restore();
  }

  draw(): void {
    const { chart } = this;

    const clipMap = this.clipMap();

    // enable clipping based on the option
    let enabled = false;
    if (clipMap === true || clipMap === 'outline' || clipMap === 'outline+graticule') {
      enabled = true;
      clipArea(chart.ctx, chart.chartArea);
    }

    if (this.showOutline() && this.getMeta().dataset) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (this.getMeta().dataset!.draw.call as any)(this.getMeta().dataset!, chart.ctx, chart.chartArea);
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

    this.getMeta().data.forEach((elem) => (elem.draw.call as any)(elem, chart.ctx, chart.chartArea));

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

export interface IGeoControllerDatasetOptions
  extends IGeoChartOptions,
    ScriptableAndArrayOptions<IGeoFeatureOptions, ScriptableContext<'choropleth' | 'bubbleMap'>>,
    AnimationOptions<'choropleth' | 'bubbleMap'> {
  xAxisID?: string;
  yAxisID?: string;
  rAxisID?: string;
  iAxisID?: string;
  vAxisID?: string;
}

export interface IGeoDataPoint {
  feature: ExtendedFeature;
  center?: {
    longitude: number;
    latitude: number;
  };
}
