import * as Chart from 'chart.js';
import { geoDefaults, Geo } from './geo';
import { wrapProjectionScale } from '../scales';
import { resolveScale } from './utils';

const defaults = {
  showOutline: true,
  clipMap: 'outline+graticule',
  hover: {
    mode: 'single',
  },

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
  geo: {
    radiusScale: {
      display: false,
      id: 'radius',
      type: 'size',
    },
  },
  elements: {
    point: {
      radius(context) {
        if (context.dataIndex == null) {
          return null;
        }
        const value = context.dataset.data[context.dataIndex];
        const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
        return controller.valueToRadius(value);
      },
    },
  },
};

Chart.defaults.bubbleMap = Chart.helpers.configMerge(geoDefaults, defaults);

const superClass = Geo.prototype;
const bubbleClass = Chart.controllers.bubble.prototype;
export const BubbleMap = (Chart.controllers.bubbleMap = Geo.extend({
  dataElementType: Chart.elements.Point,

  _dataElementOptions: bubbleClass._dataElementOptions,

  linkScales() {
    superClass.linkScales.call(this);
    if (this._radiusScale) {
      Chart.layouts.removeBox(this.chart, this._radiusScale);
    }
    this._radiusScale = resolveScale(this.chart, this.chart.options.geo.radiusScale);
  },

  _getValueScale() {
    const base = superClass._getValueScale.call(this);
    if (!this._radiusScale) {
      return base;
    }
    return wrapProjectionScale(base, this._radiusScale.options.property);
  },

  updateElement(point, index, reset) {
    superClass.updateElement.apply(this, arguments);

    const meta = this.getMeta();
    const custom = point.custom || {};
    const data = this.getDataset().data[index];

    const scale = this.getProjectionScale();
    const [x, y] = scale.projection([
      data.longitude == null ? data.x : data.longitude,
      data.latitude == null ? data.y : data.latitude,
    ]);

    point._xScale = this.getScaleForId(meta.xAxisID);
    point._yScale = this.getScaleForId(meta.yAxisID);
    point._datasetIndex = this.index;
    point._index = index;

    const method = bubbleClass._resolveElementOptions || bubbleClass._resolveDataElementOptions;
    const options = method.call(this, point, index);
    point._options = options;
    point._model = {
      backgroundColor: options.backgroundColor,
      borderColor: options.borderColor,
      borderWidth: options.borderWidth,
      hitRadius: options.hitRadius,
      pointStyle: options.pointStyle,
      rotation: options.rotation,
      radius: reset ? 0 : options.radius,
      skip: custom.skip || isNaN(x) || isNaN(y),
      x,
      y,
    };

    if (this._radiusScale) {
      this._radiusScale._model = options;
    }

    point.pivot();
  },

  valueToRadius(value) {
    return this._radiusScale ? this._radiusScale.getSizeForValue(value) : 5;
  },
}));
