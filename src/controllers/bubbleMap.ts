import {
  BubbleController,
  Chart,
  ChartItem,
  IChartConfiguration,
  IChartDataset,
  ICommonHoverOptions,
  IControllerDatasetOptions,
  IPointOptions,
  IPointProps,
  IScriptableContext,
  ITooltipItem,
  Point,
  ScriptableAndArrayOptions,
  UpdateMode,
} from 'chart.js';
import { merge } from 'chart.js/helpers/core';
import { GeoFeature, IGeoFeatureOptions } from '../elements';
import { ILogarithmicSizeScaleType, ISizeScaleType, ProjectionScale, SizeScale, IProjectionScaleType } from '../scales';
import { GeoController, geoDefaults, IGeoChartOptions } from './geo';
import patchController from './patchController';

export class BubbleMapController extends GeoController<Point> {
  initialize() {
    super.initialize();
    this.enableOptionSharing = true;
  }
  linkScales() {
    super.linkScales();
    const dataset = this.getGeoDataset();
    const meta = this.getMeta();
    meta.vAxisID = meta.rAxisID = 'r';
    dataset.vAxisID = dataset.rAxisID = 'r';
    meta.rScale = this.getScaleForId('r');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID!;
  }

  parse(start: number, count: number) {
    const rScale = this.getMeta().rScale!;
    const data = (this.getDataset().data as unknown) as IBubbleMapDataPoint[];
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; ++i) {
      const d = data[i];
      meta._parsed[i] = {
        x: d.longitude == null ? d.x : d.longitude,
        y: d.latitude == null ? d.y : d.latitude,
        [rScale.axis]: rScale.parse(d, i),
      };
    }
  }

  updateElements(elems: Point[], start: number, mode: UpdateMode) {
    const reset = mode === 'reset';
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();

    (this.getMeta().rScale! as SizeScale)._model = firstOpts; // for legend rendering styling

    this.updateSharedOptions(sharedOptions, mode, firstOpts);

    for (let i = 0; i < elems.length; i++) {
      const index = start + i;
      const elem = elems[i];
      const parsed = this.getParsed(i);
      const xy = scale.projection!([parsed.x, parsed.y]);
      const properties: IPointProps & { options?: IPointOptions; skip: boolean } = {
        x: xy ? xy[0] : 0,
        y: xy ? xy[1] : 0,
        skip: Number.isNaN(parsed.x) || Number.isNaN(parsed.y),
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(index, mode);
        if (reset) {
          properties.options!.radius = 0;
        }
      }
      this.updateElement(elem, index, properties, mode);
    }
  }

  indexToRadius(index: number) {
    const rScale = this.getMeta().rScale as SizeScale;
    return rScale.getSizeForValue(this.getParsed(index)[rScale.axis]);
  }

  static readonly id = 'bubbleMap';

  static readonly defaults: any = merge({}, [
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
          label(item: ITooltipItem) {
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
          radius(context: IScriptableContext) {
            if (context.dataIndex == null) {
              return null;
            }
            const controller = context.chart.getDatasetMeta(context.datasetIndex).controller as BubbleMapController;
            return controller.indexToRadius(context.dataIndex);
          },
          hoverRadius: undefined,
        },
      },
    },
  ]);
}

export interface IBubbleMapDataPoint {
  longitude: number;
  latitude: number;
  x?: number;
  y?: number;
  value: number;
}

export interface IBubbleMapChartOptions extends IGeoChartOptions {
  scales: {
    xy: IProjectionScaleType;
    r: ISizeScaleType | ILogarithmicSizeScaleType;
  };
}

export interface IBubbleMapControllerDatasetOptions
  extends IControllerDatasetOptions,
    IGeoChartOptions,
    ScriptableAndArrayOptions<IGeoFeatureOptions>,
    ScriptableAndArrayOptions<ICommonHoverOptions> {}

export type IBubbleMapControllerDataset<T = IBubbleMapDataPoint> = IChartDataset<T, IBubbleMapControllerDatasetOptions>;

export type IBubbleMapControllerConfiguration<T = IBubbleMapDataPoint, L = string> = IChartConfiguration<
  'bubbleMap',
  T,
  L,
  IBubbleMapControllerDataset<T>,
  IBubbleMapChartOptions
>;

export class BubbleMapChart<T = IBubbleMapDataPoint, L = string> extends Chart<
  T,
  L,
  IBubbleMapControllerConfiguration<T, L>
> {
  static id = BubbleMapController.id;

  constructor(item: ChartItem, config: Omit<IBubbleMapControllerConfiguration<T, L>, 'type'>) {
    super(item, patchController('bubbleMap', config, BubbleMapController, GeoFeature, [SizeScale, ProjectionScale]));
  }
}
