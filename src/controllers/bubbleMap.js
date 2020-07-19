import { Chart, Point, BubbleController, merge } from '@sgratzl/chartjs-esm-facade';
import { geoDefaults, GeoController } from './geo';
import { SizeScale } from '../scales';
import { GeoFeature } from '../elements';

export class BubbleMapController extends GeoController {
  linkScales() {
    super.linkScales();
    const dataset = this.getDataset();
    const meta = this.getMeta();
    meta.vAxisID = meta.rAxisID = 'r';
    dataset.vAxisID = dataset.rAxisID = 'r';
    meta.rScale = this.getScaleForId('r');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID;
  }

  parse(start, count) {
    const rScale = this.getMeta().rScale;
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; ++i) {
      const d = data[i];
      meta._parsed[i] = {
        x: d.longitude == null ? d.x : d.longitude,
        y: d.latitude == null ? d.y : d.latitude,
        [rScale.axis]: rScale.parse(d),
      };
    }
  }

  updateElements(elems, start, mode) {
    const reset = mode === 'reset';
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode, elems[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();

    this.getMeta().rScale._model = firstOpts; // for legend rendering styling

    for (let i = 0; i < elems.length; i++) {
      const index = start + i;
      const elem = elems[i];
      const parsed = this.getParsed(i);
      const xy = scale.projection([parsed.x, parsed.y]);
      const properties = {
        x: xy ? xy[0] : 0,
        y: xy ? xy[1] : 0,
        skip: Number.isNaN(parsed.x) || Number.isNaN(parsed.y),
      };
      if (includeOptions) {
        properties.options = this.resolveDataElementOptions(index, mode);
        if (reset) {
          properties.options.radius = 0;
        }
      }
      this.updateElement(elem, index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode);
  }

  indexToRadius(index) {
    const rScale = this.getMeta().rScale;
    return rScale.getSizeForValue(this.getParsed(index)[rScale.axis]);
  }
}

BubbleMapController.id = 'bubbleMap';
BubbleMapController.defaults = merge({}, [
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
        label(item) {
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
        radius(context) {
          if (context.dataIndex == null) {
            return null;
          }
          const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
          return controller.indexToRadius(context.dataIndex);
        },
        hoverRadius: undefined,
      },
    },
  },
]);

export class BubbleMapChart extends Chart {
  constructor(item, config) {
    super(item, patchController(config, BubbleMapController, GeoFeature, SizeScale));
  }
}
BubbleMapChart.id = BubbleMapController.id;
