# Chart.js Graphs

[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

Chart.js module for charting maps with legends. Adding new chart types: `choropleth` and `bubbleMap`.

**Works only with Chart.js >= 3.0.0**

![Choropleth](https://user-images.githubusercontent.com/4129778/78821942-8b974700-79da-11ea-988d-142f7788ffe6.png)

[![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/gOaBQep)

![Earth Choropleth](https://user-images.githubusercontent.com/4129778/78821946-8d610a80-79da-11ea-9ebb-23baca9db670.png)

[![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/bGVmQKw)

![Bubble Map](https://user-images.githubusercontent.com/4129778/78821935-89cd8380-79da-11ea-81bf-842fcbd3eff4.png)

[![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/YzyJRvm)

works great with https://github.com/chartjs/chartjs-plugin-datalabels

## Install

```bash
npm install --save chart.js@next chartjs-chart-geo@next
```

## Usage

see [Samples](https://github.com/sgratzl/chartjs-chart-geo/tree/master/samples) on Github

CodePens

- [Choropleth](https://codepen.io/sgratzl/pen/gOaBQep)
- [Earth Choropleth](https://codepen.io/sgratzl/pen/bGVmQKw)
- [Bubble Map](https://codepen.io/sgratzl/pen/YzyJRvm)

## Options

The option can be set globally or per dataset

```ts
interface IGeoChartOptions {
  /**
   * Outline used to scale and centralize the projection in the chart area.
   * By default a sphere is used
   * @default { type: 'Sphere" }
   */
  outline: Feature | Feature[];
  /**
   * option to render the outline in the background, see also the outline... styling option
   * @default false
   */
  showOutline: boolean;

  /**
   * option to render a graticule in the background, see also the outline... styling option
   * @default false
   */
  showGraticule:
    | boolean
    | {
        stepMajor: [number, number];
        stepMinor: [number, number];
      };

  /**
   * option whether to clip the rendering to the chartArea of the graph
   * @default choropleth: true bubbleMap: 'outline+graticule'
   */
  clipMap: boolean | 'outline' | 'graticule' | 'outline+graticule' | 'items';
}
```

## Choropleth

A Choropleth (chart type: `choropleth`) is used to render maps with the area filled according to some numerical value.

![Choropleth](https://user-images.githubusercontent.com/4129778/78821942-8b974700-79da-11ea-988d-142f7788ffe6.png)

[![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/gOaBQep)

![Earth Choropleth](https://user-images.githubusercontent.com/4129778/78821946-8d610a80-79da-11ea-9ebb-23baca9db670.png)

[![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/bGVmQKw)

### Data Structure

A data point has to have a `.feature` property containing the feature to render and a `.value` property containing the value for the coloring.

[TopoJson](https://github.com/topojson) is packaged with this plugin to convert data, it is exposed as `ChartGeo.topojson` in the global context. However, this plugin doesn't include any topojson files itself. Some useful resources I found so far:

- US map: https://www.npmjs.com/package/us-atlas
- World map: https://www.npmjs.com/package/world-atlas
- individual countries: https://github.com/markmarkoh/datamaps/tree/master/src/js/data (untested)

```js
const us = await fetch('https://unpkg.com/us-atlas/states-10m.json').then((r) => r.json());

// whole US for the outline
const nation = ChartGeo.topojson.feature(us, us.objects.nation).features[0];
// individual states
const states = ChartGeo.topojson.feature(us, us.objects.states).features;

const alaska = states.find((d) => d.properties.name === 'Alaska');
const california = states.find((d) => d.properties.name === 'California');
...

const config = {
  data: {
    labels: ['Alaska', 'California'],
    datasets: [{
      label: 'States',
      outline: nation, // ... outline to compute bounds
      showOutline: true,
      data: [
        {
          value: 0.4,
          feature: alaska // ... the feature to render
        },
        {
          value: 0.3,
          feature: california
        }
      ]
    }]
  },
  options: {
    scales: {
      xy: {
        projection: 'albersUsa' // ... projection method
      }
    }
  }
};

```

### Styling

The styling of the new element `GeoFeature` is based on [Rectangle Element](https://www.chartjs.org/docs/latest/configuration/elements.html#rectangle-configuration) with some additional options for the outline and graticule.

```ts
interface IGeoFeatureOptions {
  // all options of an Rectangle

  /**
   * background color for the outline
   * @default null
   */
  outlineBackgroundColor: string | null;
  /**
   * border color for the outline
   * @default defaultColor of Chart.js
   */
  outlineBorderColor: string;
  /**
   * border width for the outline
   * @default 0
   */
  outlineBorderWidth: number;

  /**
   * border color for the graticule
   * @default #CCCCCC
   */
  graticuleBorderColor: string;
  /**
   * border width for the graticule
   * @default 0
   */
  graticuleBorderWidth: string;
}
```

### Legend and Color Scale

The coloring of the nodes will be done with a special color scale. The scale itself is based on a linear scale.

```ts
interface IChartOptions {
  scales: {
    color: IColorScaleOptions;
  }
}

interface IColorScaleOptions {
  // support all options from linear scale -> https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#linear-cartesian-axis
  // e.g. for tick manipulation, ...

  /**
   * whether to render a color legend
   * @default false (for compatibility reasons)
   */
  display: boolean;

  /**
   * color interpolation method which is either a function
   * converting a normalized value to string or a
   * well defined string of all the interpolation scales
   * from https://github.com/d3/d3-scale-chromatic.
   * e.g. interpolateBlues -> blues
   *
   * @default blues
   */
  interpolate: string | (normalizedValue: number) => string;

  /**
   * color value to render for missing values
   * @default transparent
   */
  missing: string;

  /**
   * allows to split the colorscale in N quantized equal bins.
   * @default 0
   */
  quantize: number;

  /**
   * the property name that stores the value in the data elements
   * @default value
   */
  property: string;

  legend: {
    /**
     * location of the legend on the chart area
     * @default bottom-right
     */
    position: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'top-right' | 'bottom-right';
    /**
     * alignment of the scale, e.g., `right` means that it is a vertical scale
     * with the ticks on the right side
     * @default right
     */
    align: 'left' | 'right' | 'top' | 'bottom';
    /**
     * length of the legend, i.e., for a horizontal scale the width
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 100
     */
    length: number;
    /**
     * how wide the scale is, i.e., for a horizontal scale the height
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 50
     */
    width: number;
    /**
     * how many pixels should be used for the color bar
     * @default 10
     */
    indicatorWidth: number;
    /**
     * margin pixels such that it doesn't stick to the edge of the chart
     * @default 8
     */
    margin: number;
  }
}
```

## Bubble Map

A Bubble Map (chart type: `bubbleMap`) aka Proportional Symbol is used to render maps with dots that are scaled according to some numerical value. It is based on a regular `bubble` chart where the positioning is done using latitude and longtitude with an additional `radiusScale` to create a legend for the different radi.

![Bubble Map](https://user-images.githubusercontent.com/4129778/78821935-89cd8380-79da-11ea-81bf-842fcbd3eff4.png)

[![Open in CodePen][codepen]](https://codepen.io/sgratzl/pen/YzyJRvm)

### Data Structure

see [Bubble Chart](https://www.chartjs.org/docs/latest/charts/bubble.html#data-structure). Alternatively to `x` and `y`, the following structure can be used:

```ts
interface IBubbleMapPoint {
  longitude: number;
  latitude: number;
  value: number;
}
```

**Note**: instead of using the `r` attribute as in a regular bubble chart, the `value` attribute is used, which is picked up by the `radiusScale` to convert it to an actual pixel radius value.

### Styling

A regular point is used and thus supports the [Point Element](https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration) styling options. In addition, the `outline*` and `graticule*` are supported.

### Legend

Similar to the choropleth chart a new `radiusScale` is used to map the values to symbol radius size. The scale itself is based on a linear scale.

```ts
interface IChartOptions {
  scales: {
    color: ISizeScaleOptions;
  };
}

interface ISizeScaleOptions {
  // support all options from linear scale -> https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#linear-cartesian-axis
  // e.g. for tick manipulation, ...

  /**
   * whether to render a color legend
   * @default false (for compatibility reasons)
   */
  display: boolean;

  /**
   * radius range in pixel, the minimal data value will be mapped to the
   * first entry,  the maximal one to the second and a linear interpolation
   * for all values in between.
   *
   * @default [2, 20]
   */
  range: [number, number];

  /**
   * operation mode for the scale, area means that the area is linearly increasing whereas radius the radius is.
   * The area one is the default since it gives a better visual comparison of values
   * @default area
   */
  mode: 'radius' | 'area';

  /**
   * radius to render for missing values
   * @default 1
   */
  missing: number;

  /**
   * the property name that stores the value in the data elements
   * @default value
   */
  property: string;

  legend: {
    /**
     * location of the legend on the chart area
     * @default bottom-right
     */
    position: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'top-right' | 'bottom-right';
    /**
     * alignment of the scale, e.g., `right` means that it is a vertical scale
     * with the ticks on the right side
     * @default bottom
     */
    align: 'left' | 'right' | 'top' | 'bottom';
    /**
     * length of the legend, i.e., for a horizontal scale the width
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 90
     */
    length: number;
    /**
     * how wide the scale is, i.e., for a horizontal scale the height
     * if a value < 1 is given, is it assume to be a ratio of the corresponding
     * chart area
     * @default 70
     */
    width: number;
    /**
     * how many pixels should be used for the color bar
     * @default 42
     */
    indicatorWidth: number;
    /**
     * margin pixels such that it doesn't stick to the edge of the chart
     * @default 8
     */
    margin: number;
  };
}
```

## Scales

A new scale `projection` is registered and used by default by Choropleth and BubbleMap. It provides just one option to specify the projection method. The available methods are the one from https://github.com/d3/d3-geo#projections. Just remove the `geo` prefix. Alternatively, the projection method instance can be directly given.

```ts
interface IChartOptions {
  scales: {
    xy: IProjectionScaleOptions;
  };
}

interface IProjectionScaleOptions {
  /**
   * projection method used
   * @default albersUsa
   */
  projection: string | Function;
}
```

### ESM and Tree Shaking

The ESM build of the library supports tree shaking thus having no side effects. As a consequence the chart.js library won't be automatically manipulated nor new controllers automatically registered. One has to manually import and register them.

Variant A:

```js
import Chart from 'chart.js';
import { ChoroplethController } from 'chartjs-chart-geo';

// register controller in chart.js and ensure the defaults are set
ChoroplethController.register();

const chart = new Chart(document.getElementById('canvas').getContext('2d'), {
  type: ChoroplethController.id,
  data: {
    // ...
  },
});
```

Variant B:

```js
import { ChoroplethChart } from 'chartjs-chart-geo';

const chart = new ChoroplethChart(document.getElementById('canvas').getContext('2d'), {
  data: {
    //...
  },
});
```

## Development Environment

```sh
npm i -g yarn
yarn set version 2
yarn
yarn pnpify --sdk
```

### Building

```sh
yarn install
yarn build
```

[npm-image]: https://badge.fury.io/js/chartjs-chart-geo.svg
[npm-url]: https://npmjs.org/package/chartjs-chart-geo
[github-actions-image]: https://github.com/sgratzl/chartjs-chart-geo/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/chartjs-chart-geo/actions
[codepen]: https://img.shields.io/badge/CodePen-open-blue?logo=codepen
