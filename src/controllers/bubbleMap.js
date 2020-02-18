'use strict';

import * as Chart from 'chart.js';
import {geoDefaults, Geo} from './geo';

const defaults = {
  showOutline: true,
  clipMap: 'outline+graticule',
  hover: {
    mode: 'single'
  },

  tooltips: {
    callbacks: {
      title() {
        // Title doesn't make sense for scatter since we format the data as a point
        return '';
      },
      label(item, data) {
        const datasetLabel = data.labels[item.index] || '';
        const dataPoint = data.datasets[item.datasetIndex].data[item.index];
        return `${datasetLabel}: ${dataPoint.r}`;
      }
    }
  }
};

Chart.defaults.bubbleMap = Chart.helpers.configMerge(geoDefaults, defaults);

const superClass = Geo.prototype;
const bubbleClass = Chart.controllers.bubble.prototype;
export const BubbleMap = Chart.controllers.bubbleMap = Geo.extend({
  dataElementType: Chart.elements.Point,

  _dataElementOptions: bubbleClass._dataElementOptions,

  updateElement(point, index, reset) {
    superClass.updateElement.apply(this, arguments);

    const meta = this.getMeta();
    const custom = point.custom || {};
    const data = this.getDataset().data[index];

    // TOOD
    const scale = this.getProjectionScale();
    const [x, y] = scale.projection([
      data.longitude == null ? data.x : data.longitude,
      data.latitude == null ? data.y : data.latitude
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

    point.pivot();
  },

  /**
	 * @protected
	 */
  setHoverStyle(point) {
    bubbleClass.setHoverStyle.call(this, point);
  },
});
