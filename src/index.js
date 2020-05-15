export * from './elements';
export * from './controllers';
export * from './scales';

import * as t from 'topojson-client';

export const topojson = t;

import { Choropleth, BubbleMap } from './controllers';
import { ColorScale, ProjectionScale, SizeScale } from './scales';
import { controllers, defaults, scaleService } from 'chart.js';

Object.assign(controllers, {
  [Choropleth.id]: Choropleth,
  [BubbleMap.id]: BubbleMap,
});
defaults.set(Choropleth.id, Choropleth.defaults);
defaults.set(BubbleMap.id, BubbleMap.defaults);
scaleService.registerScale(ProjectionScale);
scaleService.registerScale(ColorScale);
scaleService.registerScale(SizeScale);
