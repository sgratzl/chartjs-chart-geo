export * from '.';

import { ChoroplethController, BubbleMapController } from './controllers';
import { ColorLogarithmicScale, SizeLogarithmicScale } from './scales';

ChoroplethController.register();
BubbleMapController.register();

ColorLogarithmicScale.register();
SizeLogarithmicScale.register();
