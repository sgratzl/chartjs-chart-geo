import {
  Chart,
  ChartItem,
  ChartConfiguration,
  CommonHoverOptions,
  ControllerDatasetOptions,
  PointOptions,
  PointProps,
  ScriptableContext,
  TooltipItem,
  PointElement,
  PointHoverOptions,
  Element,
  Scale,
  ScriptableAndArrayOptions,
  UpdateMode,
  AnimationOptions,
} from 'chart.js';
import { merge } from 'chart.js/helpers';
import { GeoFeature, IGeoFeatureOptions } from '../elements';
import { ProjectionScale, SizeScale } from '../scales';
import { GeoController, geoDefaults, geoOverrides, IGeoChartOptions } from './GeoController';
import patchController from './patchController';

type MyPointElement = PointElement & Element<PointProps, PointOptions & PointHoverOptions & Record<string, unknown>>;

export class BubbleMapController extends GeoController<'bubbleMap', MyPointElement> {
  initialize(): void {
    super.initialize();
    this.enableOptionSharing = true;
  }

  linkScales(): void {
    super.linkScales();
    const dataset = this.getGeoDataset();
    const meta = this.getMeta();
    meta.vAxisID = 'size';
    meta.rAxisID = 'size';
    dataset.vAxisID = 'size';
    dataset.rAxisID = 'size';
    meta.rScale = this.getScaleForId('size');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    meta.iAxisID = meta.xAxisID!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dataset.iAxisID = meta.xAxisID!;
  }

  // eslint-disable-next-line class-methods-use-this
  _getOtherScale(scale: Scale): Scale {
    // for strange get min max with other scale
    return scale;
  }

  parse(start: number, count: number): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rScale = this.getMeta().rScale!;
    const data = this.getDataset().data as unknown as IBubbleMapDataPoint[];
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; i += 1) {
      const d = data[i];
      meta._parsed[i] = {
        x: d.longitude == null ? d.x : d.longitude,
        y: d.latitude == null ? d.y : d.latitude,
        [rScale.axis]: rScale.parse(d, i),
      };
    }
  }

  updateElements(elems: MyPointElement[], start: number, count: number, mode: UpdateMode): void {
    const reset = mode === 'reset';
    const firstOpts = this.resolveDataElementOptions(start, mode);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sharedOptions = this.getSharedOptions(firstOpts)!;
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();

    (this.getMeta().rScale as unknown as SizeScale)._model = firstOpts as unknown as PointOptions; // for legend rendering styling

    this.updateSharedOptions(sharedOptions, mode, firstOpts);

    for (let i = start; i < start + count; i += 1) {
      const elem = elems[i];
      const parsed = this.getParsed(i);
      const projection = scale.projection([parsed.x, parsed.y]);
      const properties: PointProps & { options?: PointOptions; skip: boolean } = {
        x: projection ? projection[0] : 0,
        y: projection ? projection[1] : 0,
        skip: Number.isNaN(parsed.x) || Number.isNaN(parsed.y),
      };
      if (includeOptions) {
        properties.options = (sharedOptions || this.resolveDataElementOptions(i, mode)) as unknown as PointOptions;
        if (reset) {
          properties.options.radius = 0;
        }
      }
      this.updateElement(elem, i, properties as unknown as Record<string, unknown>, mode);
    }
  }

  indexToRadius(index: number): number {
    const rScale = this.getMeta().rScale as SizeScale;
    return rScale.getSizeForValue(this.getParsed(index)[rScale.axis as 'r']);
  }

  static readonly id = 'bubbleMap';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    geoDefaults,
    {
      dataElementType: PointElement.id,
      datasetElementType: GeoFeature.id,
      showOutline: true,
      clipMap: 'outline+graticule',
    },
  ]);

  static readonly overrides: any = /* #__PURE__ */ merge({}, [
    geoOverrides,
    {
      plugins: {
        tooltip: {
          callbacks: {
            title() {
              // Title doesn't make sense for scatter since we format the data as a point
              return '';
            },
            label(item: TooltipItem<'bubbleMap'>) {
              if (item.formattedValue == null) {
                return item.chart.data?.labels?.[item.dataIndex];
              }
              return `${item.chart.data?.labels?.[item.dataIndex]}: ${item.formattedValue}`;
            },
          },
        },
      },
      scales: {
        size: {
          axis: 'x',
          type: SizeScale.id,
        },
      },
      elements: {
        point: {
          radius(context: ScriptableContext<'bubbleMap'>) {
            if (context.dataIndex == null) {
              return null;
            }
            const controller = (context.chart as Chart<'bubbleMap'>).getDatasetMeta(context.datasetIndex)
              .controller as BubbleMapController;
            return controller.indexToRadius(context.dataIndex);
          },
          hoverRadius(context: ScriptableContext<'bubbleMap'>) {
            if (context.dataIndex == null) {
              return null;
            }
            const controller = (context.chart as Chart<'bubbleMap'>).getDatasetMeta(context.datasetIndex)
              .controller as BubbleMapController;
            return controller.indexToRadius(context.dataIndex) + 1;
          },
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

export interface IBubbleMapControllerDatasetOptions
  extends ControllerDatasetOptions,
    IGeoChartOptions,
    ScriptableAndArrayOptions<IGeoFeatureOptions, ScriptableContext<'bubbleMap'>>,
    ScriptableAndArrayOptions<CommonHoverOptions, ScriptableContext<'bubbleMap'>>,
    AnimationOptions<'bubbleMap'> {}

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    bubbleMap: {
      chartOptions: IGeoChartOptions;
      datasetOptions: IBubbleMapControllerDatasetOptions;
      defaultDataPoint: IBubbleMapDataPoint;
      scales: keyof (ProjectionScaleTypeRegistry & SizeScaleTypeRegistry);
      metaExtensions: Record<string, never>;
      parsedDataType: { r: number; x: number; y: number };
    };
  }
}

export class BubbleMapChart<DATA extends unknown[] = IBubbleMapDataPoint[], LABEL = string> extends Chart<
  'bubbleMap',
  DATA,
  LABEL
> {
  static id = BubbleMapController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'bubbleMap', DATA, LABEL>, 'type'>) {
    super(item, patchController('bubbleMap', config, BubbleMapController, GeoFeature, [SizeScale, ProjectionScale]));
  }
}
