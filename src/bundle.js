export * from '.';

import { Choropleth, BubbleMap } from './controllers';
import { ColorLogarithmicScale, SizeLogarithmicScale } from './scales';

Choropleth.register();
BubbleMap.register();

ColorLogarithmicScale.register();
SizeLogarithmicScale.register();
