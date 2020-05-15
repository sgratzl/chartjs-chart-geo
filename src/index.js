export * from './elements';
export * from './controllers';
export * from './scales';

import * as t from 'topojson-client';

export const topojson = t;

import { Choropleth } from './controllers';
import { controllers } from 'chart.js';

controllers.choropleth = Choropleth;
