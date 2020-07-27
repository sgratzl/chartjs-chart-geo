import {
  Chart,
  merge,
  UpdateMode,
  IScriptableContext,
  ITooltipItem,
  ICommonHoverOptions,
  ScriptableAndArrayOptions,
  IControllerDatasetOptions,
  IChartDataset,
  IChartConfiguration,
  ChartItem,
  IPointOptions,
} from '@sgratzl/chartjs-esm-facade';
import { geoDefaults, GeoController, IGeoChartOptions, GeoDataPoint } from './geo';
import { GeoFeature, IGeoFeatureOptions, IGeoFeatureProps } from '../elements';
import { ColorScale, ProjectionScale } from '../scales';
import patchController from './patchController';

export class ChoroplethController extends GeoController<GeoFeature> {
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

  updateElements(elems: GeoFeature[], start: number, mode: UpdateMode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode, elems[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();

    for (let i = 0; i < elems.length; i++) {
      const index = start + i;
      const elem = elems[i];
      elem.projectionScale = scale;
      elem.feature = (this as any)._data[i].feature;
      const center = elem.getCenterPoint();

      const properties: IGeoFeatureProps & { options?: IPointOptions } = {
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

  indexToColor(index: number) {
    const rScale = this.getMeta().rScale! as ColorScale;
    return rScale.getColorForValue(this.getParsed(index)[rScale.axis]);
  }

  static id = 'choropleth';
  static defaults: any = /*#__PURE__*/ merge({}, [
    geoDefaults,
    {
      datasetElementType: GeoFeature.id,
      dataElementType: GeoFeature.id,
      dataElementOptions: ['backgroundColor', 'borderColor', 'borderWidth'],
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
        color: {
          type: ColorScale.id,
        },
      },
      elements: {
        geoFeature: {
          backgroundColor(context: IScriptableContext) {
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
  extends IControllerDatasetOptions,
    IGeoChartOptions,
    ScriptableAndArrayOptions<IGeoFeatureOptions>,
    ScriptableAndArrayOptions<ICommonHoverOptions> {}

export type IChoroplethControllerDataset<T = GeoDataPoint> = IChartDataset<T, IChoroplethControllerDatasetOptions>;

export type IChoroplethControllerConfiguration<T = GeoDataPoint, L = string> = IChartConfiguration<
  'choropleth',
  T,
  L,
  IChoroplethControllerDataset<T>
>;

export class ChoroplethChart<T = GeoDataPoint, L = string> extends Chart<
  T,
  L,
  IChoroplethControllerConfiguration<T, L>
> {
  static id = ChoroplethController.id;

  constructor(item: ChartItem, config: Omit<IChoroplethControllerConfiguration<T, L>, 'type'>) {
    super(item, patchController('choropleth', config, ChoroplethController, GeoFeature, [ColorScale, ProjectionScale]));
  }
}
