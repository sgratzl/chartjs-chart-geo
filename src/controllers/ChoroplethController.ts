import {
  Chart,
  UpdateMode,
  ScriptableContext,
  TooltipItem,
  CommonHoverOptions,
  ScriptableAndArrayOptions,
  ControllerDatasetOptions,
  ChartConfiguration,
  ChartItem,
  PointOptions,
  Scale,
  AnimationOptions,
} from 'chart.js';
import { merge } from 'chart.js/helpers';
import { geoDefaults, GeoController, IGeoChartOptions, IGeoDataPoint, geoOverrides } from './GeoController';
import { GeoFeature, IGeoFeatureOptions, IGeoFeatureProps } from '../elements';
import { ColorScale, ProjectionScale } from '../scales';
import patchController from './patchController';

export class ChoroplethController extends GeoController<'choropleth', GeoFeature> {
  initialize(): void {
    super.initialize();
    this.enableOptionSharing = true;
  }

  linkScales(): void {
    super.linkScales();
    const dataset = this.getGeoDataset();
    const meta = this.getMeta();
    meta.vAxisID = 'color';
    meta.rAxisID = 'color';
    dataset.vAxisID = 'color';
    dataset.rAxisID = 'color';
    meta.rScale = this.getScaleForId('color');
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
    const { data } = this.getDataset();
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; i += 1) {
      meta._parsed[i] = {
        [rScale.axis]: rScale.parse(data[i], i),
      };
    }
  }

  updateElements(elems: GeoFeature[], start: number, count: number, mode: UpdateMode): void {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sharedOptions = this.getSharedOptions(firstOpts)!;
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();
    this.updateSharedOptions(sharedOptions, mode, firstOpts);

    for (let i = start; i < start + count; i += 1) {
      const elem = elems[i];
      elem.projectionScale = scale;
      elem.feature = (this as any)._data[i].feature;
      elem.center = (this as any)._data[i].center;
      elem.pixelRatio = this.chart.currentDevicePixelRatio;
      const center = elem.getCenterPoint();

      const properties: IGeoFeatureProps & { options?: PointOptions } = {
        x: center.x,
        y: center.y,
      };
      if (includeOptions) {
        properties.options = (sharedOptions || this.resolveDataElementOptions(i, mode)) as unknown as PointOptions;
      }
      this.updateElement(elem, i, properties as unknown as Record<string, unknown>, mode);
    }
  }

  indexToColor(index: number): string {
    const rScale = this.getMeta().rScale as unknown as ColorScale;
    return rScale.getColorForValue(this.getParsed(index)[rScale.axis as 'r']);
  }

  static readonly id = 'choropleth';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [
    geoDefaults,
    {
      datasetElementType: GeoFeature.id,
      dataElementType: GeoFeature.id,
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
            label(item: TooltipItem<'choropleth'>) {
              if (item.formattedValue == null) {
                return item.chart.data?.labels?.[item.dataIndex];
              }
              return `${item.chart.data?.labels?.[item.dataIndex]}: ${item.formattedValue}`;
            },
          },
        },
        colors: {
          enabled: false,
        },
      },
      scales: {
        color: {
          type: ColorScale.id,
          axis: 'x',
        },
      },
      elements: {
        geoFeature: {
          backgroundColor(context: ScriptableContext<'choropleth'>) {
            if (context.dataIndex == null) {
              return null;
            }
            const controller = (context.chart as Chart<'choropleth'>).getDatasetMeta(context.datasetIndex)
              .controller as ChoroplethController;
            return controller.indexToColor(context.dataIndex);
          },
        },
      },
    },
  ]);
}

export interface IChoroplethControllerDatasetOptions
  extends ControllerDatasetOptions,
    IGeoChartOptions,
    ScriptableAndArrayOptions<IGeoFeatureOptions, ScriptableContext<'choropleth'>>,
    ScriptableAndArrayOptions<CommonHoverOptions, ScriptableContext<'choropleth'>>,
    AnimationOptions<'choropleth'> {}

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    choropleth: {
      chartOptions: IGeoChartOptions;
      datasetOptions: IChoroplethControllerDatasetOptions;
      defaultDataPoint: IGeoDataPoint & { value: number };
      scales: keyof (ProjectionScaleTypeRegistry & ColorScaleTypeRegistry);
      metaExtensions: Record<string, never>;
      parsedDataType: { r: number };
    };
  }
}

export class ChoroplethChart<DATA extends unknown[] = IGeoDataPoint[], LABEL = string> extends Chart<
  'choropleth',
  DATA,
  LABEL
> {
  static id = ChoroplethController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'choropleth', DATA, LABEL>, 'type'>) {
    super(item, patchController('choropleth', config, ChoroplethController, GeoFeature, [ColorScale, ProjectionScale]));
  }
}
