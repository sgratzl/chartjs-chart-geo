import { registry } from 'chart.js';
import { ChoroplethController, BubbleMapController } from './controllers';
import { ColorLogarithmicScale, SizeLogarithmicScale, ProjectionScale, ColorScale, SizeScale } from './scales';
import { GeoFeature } from './elements';

export * from '.';

registry.addControllers(ChoroplethController, BubbleMapController);
registry.addScales(ColorLogarithmicScale, SizeLogarithmicScale, ProjectionScale, ColorScale, SizeScale);
registry.addElements(GeoFeature);
