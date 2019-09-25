'use strict';

import * as Chart from 'chart.js';
import {geoDefaults, Geo} from './geo';

const defaults = {
};

Chart.defaults.choropleth = Chart.helpers.configMerge(geoDefaults, defaults);

const superClass = Geo.prototype;
export const Choropleth = Chart.controllers.choropleth = Geo.extend({
  updateElement(elem, index, reset) {
    superClass.updateElement.call(this, elem, index, reset);
    const ds = this.getDataset();
    const value = ds.data[index];

    elem._model = {
      borderColor: 'black',
      backgroundColor: `rgb(${Math.round(value.value * 255)}, 0, 0)`,
      borderWidth: 1
    };

    elem.pivot();
  },
});
