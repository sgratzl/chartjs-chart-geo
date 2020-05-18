import { controllers, defaults, merge } from '../chart';
import { geoDefaults, GeoController } from './geo';
import { GeoFeature } from '../elements';
import { ColorScale } from '../scales';
import { patchControllerConfig } from './utils';

export class ChoroplethController extends GeoController {
  linkScales() {
    super.linkScales();
    const dataset = this.getDataset();
    const meta = this.getMeta();
    meta.vAxisID = meta.rAxisID = 'color';
    dataset.vAxisID = dataset.rAxisID = 'color';
    meta.rScale = this.getScaleForId('color');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID;
  }

  parse(start, count) {
    const rScale = this.getMeta().rScale;
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; ++i) {
      meta._parsed[i] = {
        [rScale.axis]: rScale.parse(data[i]),
      };
    }
  }

  updateElements(elems, start, mode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode, elems[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const scale = this.getProjectionScale();

    for (let i = 0; i < elems.length; i++) {
      const index = start + i;
      const elem = elems[i];
      elem.projectionScale = scale;
      elem.feature = this._data[i].feature;
      const center = elem.getCenterPoint();

      const properties = {
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

  indexToColor(index) {
    const rScale = this.getMeta().rScale;
    return rScale.getColorForValue(this.getParsed(index)[rScale.axis]);
  }
}

ChoroplethController.prototype.dataElementOptions = ['backgroundColor', 'borderColor', 'borderWidth'];

ChoroplethController.id = 'choropleth';
ChoroplethController.register = () => {
  ChoroplethController.prototype.datasetElementType = GeoFeature.register();
  ChoroplethController.prototype.dataElementType = GeoFeature.register();
  controllers[ChoroplethController.id] = ChoroplethController;
  defaults.set(
    ChoroplethController.id,
    merge({}, [
      geoDefaults(),
      {
        tooltips: {
          callbacks: {
            title() {
              // Title doesn't make sense for scatter since we format the data as a point
              return '';
            },
            label(item, data) {
              if (item.value == null) {
                return data.labels[item.index];
              }
              return `${data.labels[item.index]}: ${item.value}`;
            },
          },
        },
        scales: {
          color: {
            type: ColorScale.register().id,
          },
        },
        elements: {
          geoFeature: {
            backgroundColor(context) {
              if (context.dataIndex == null) {
                return null;
              }
              const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
              return controller.indexToColor(context.dataIndex);
            },
          },
        },
      },
    ])
  );
  return ChoroplethController;
};

export class ChoroplethChart extends Chart {
  constructor(item, config) {
    super(item, patchControllerConfig(config, ChoroplethController));
  }
}
ChoroplethChart.id = ChoroplethController.id;
