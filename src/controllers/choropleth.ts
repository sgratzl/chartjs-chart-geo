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
} from 'chart.js';
import { merge } from 'chart.js/helpers';
import { geoDefaults, GeoController, IGeoChartOptions, IGeoDataPoint } from './geo';
import { GeoFeature, IGeoFeatureOptions, IGeoFeatureProps } from '../elements';
import { ColorScale, ProjectionScale } from '../scales';
import patchController from './patchController';

export class ChoroplethController extends GeoController<GeoFeature> {
  initialize() {
    super.initialize();
    this.enableOptionSharing = true;
  }
  linkScales() {
    super.linkScales();
    const dataset = this.getGeoDataset();
    const meta = this.getMeta();
    meta.vAxisID = meta.rAxisID = 'color';
    dataset.vAxisID = dataset.rAxisID = 'color';
    meta.rScale = this.getScaleForId('color');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID!;
  }

  _getOtherScale(scale: Scale) {
    // for strange get min max with other scale
    return scale;
  }

  parse(start: number, count: number) {
    const rScale = this.getMeta().rScale!;
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; ++i) {
      meta._parsed[i] = {
        [rScale.axis]: rScale.parse(data[i], i),
      };
    }
  }

  updateElements(elems: GeoFeature[], start: number, count: number, mode: UpdateMode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();
    this.updateSharedOptions(sharedOptions, mode, firstOpts);

    for (let i = start; i < start + count; i++) {
      const elem = elems[i];
      elem.projectionScale = scale;
      elem.feature = (this as any)._data[i].feature;
      const center = elem.getCenterPoint();

      const properties: IGeoFeatureProps & { options?: PointOptions } = {
        x: center.x,
        y: center.y,
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, mode);
      }
      this.updateElement(elem, i, properties, mode);
    }
  }

  indexToColor(index: number) {
    const rScale = this.getMeta().rScale! as ColorScale;
    return rScale.getColorForValue(this.getParsed(index)[rScale.axis]);
  }

  static readonly id = 'choropleth';
  static readonly defaults: any = /*#__PURE__*/ merge({}, [
    geoDefaults,
    {
      datasetElementType: GeoFeature.id,
      dataElementType: GeoFeature.id,
      dataElementOptions: ['backgroundColor', 'borderColor', 'borderWidth'],
      plugins: {
        tooltip: {
          callbacks: {
            title() {
              // Title doesn't make sense for scatter since we format the data as a point
              return '';
            },
            label(item: TooltipItem) {
              if (item.formattedValue == null) {
                return item.chart.data.labels[item.dataIndex];
              }
              return `${item.chart.data.labels[item.dataIndex]}: ${item.formattedValue}`;
            },
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
          backgroundColor(context: ScriptableContext) {
            if (context.dataIndex == null) {
              return null;
            }
            const controller = context.chart.getDatasetMeta(context.datasetIndex).controller as ChoroplethController;
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
    ScriptableAndArrayOptions<IGeoFeatureOptions, ScriptableContext>,
    ScriptableAndArrayOptions<CommonHoverOptions, ScriptableContext> {}

declare module 'chart.js' {
  export interface ChartTypeRegistry {
    choropleth: {
      chartOptions: IGeoChartOptions;
      datasetOptions: IChoroplethControllerDatasetOptions;
      defaultDataPoint: IGeoDataPoint[];
      scales: keyof IScaleTypeRegistry;
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
