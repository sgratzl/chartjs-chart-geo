import { registry } from 'chart.js';
import { ColorLogarithmicScale, SizeLogarithmicScale, ProjectionScale, ColorScale, SizeScale } from './scales';
import { GeoFeature } from './elements';
import { ChoroplethController, BubbleMapController } from './controllers';

export * from '.';

registry.addScales(ColorLogarithmicScale, SizeLogarithmicScale, ProjectionScale, ColorScale, SizeScale);
registry.addElements(GeoFeature);
registry.addControllers(ChoroplethController, BubbleMapController);
