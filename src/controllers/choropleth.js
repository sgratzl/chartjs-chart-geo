'use strict';

import * as Chart from 'chart.js';
import {geoDefaults, Geo} from './geo';

const defaults = {
  hover: {
		mode: 'single'
  },
	tooltips: {
		callbacks: {
			label: function(item, data) {
				const datasetLabel = data.datasets[item.datasetIndex].label || '';
				const dataPoint = data.datasets[item.datasetIndex].data[item.index];
				return datasetLabel + ': ' + dataPoint.value;
			}
		}
	}
};

Chart.defaults.choropleth = Chart.helpers.configMerge(geoDefaults, defaults);

const superClass = Geo.prototype;
export const Choropleth = Chart.controllers.choropleth = Geo.extend({
  dataElementType: Chart.elements.GeoFeature,

  updateElement(elem, index, reset) {
    superClass.updateElement.call(this, elem, index, reset);
    this.updateGeoFeatureElement(elem, index, reset);
  },
});
