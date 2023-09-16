import Theme from 'vitepress/theme';
import { createTypedChart } from 'vue-chartjs';
import { Tooltip, PointElement } from 'chart.js';
import {
  BubbleMapController,
  ChoroplethController,
  ColorScale,
  ColorLogarithmicScale,
  SizeLogarithmicScale,
  SizeScale,
  GeoFeature,
  ProjectionScale,
} from '../../../src';

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.component(
      'BubbleMapChart',
      createTypedChart('bubbleMap', [
        ProjectionScale,
        BubbleMapController,
        SizeScale,
        SizeLogarithmicScale,
        PointElement,
        GeoFeature,
        Tooltip,
      ])
    );
    app.component(
      'ChoroplethChart',
      createTypedChart('choropleth', [
        ProjectionScale,
        ChoroplethController,
        ColorScale,
        ColorLogarithmicScale,
        GeoFeature,
        Tooltip,
      ])
    );
  },
};
