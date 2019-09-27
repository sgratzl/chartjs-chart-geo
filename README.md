# Chart.js Graphs
[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

Chart.js module for charting maps. Adding new chart types: `choropleth` and `bubbleMap`l

**Works only with Chart.js >= 2.8.0**

![Choropleth](https://user-images.githubusercontent.com/4129778/65654910-4c7a4900-dfe8-11e9-8712-e56557452907.png)

[CodePen]()

![Earth Choropleth](https://user-images.githubusercontent.com/4129778/65734104-73478680-e09f-11e9-86dd-22e80918bce5.png)

[CodePen]()

![Bubble Map](https://user-images.githubusercontent.com/4129778/65734563-84919280-e0a1-11e9-87ea-1692b22b1fae.png)

[CodePen]()

works great with https://github.com/chartjs/chartjs-plugin-datalabels

## Install

```bash
npm install --save chart.js chartjs-chart-geo
```

## Usage
see [Samples](https://github.com/sgratzl/chartjs-chart-geo/tree/master/samples) on Github

CodePens
 * [Choropleth]()
 * [Earth Choropleth]()
 * [Bubble Map]()

## Options

The option can be sent globally or per dataset

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
  graticule: boolean | {
    stepMajor: [number, number],
    stepMinor: [number, number]
  };
}
```

## Choropleth

A Choropleth (chart type: `choropleth`) is used to render maps with the area filled according to some numerical value.

![Choropleth](https://user-images.githubusercontent.com/4129778/65654910-4c7a4900-dfe8-11e9-8712-e56557452907.png)

[CodePen]()

![Earth Choropleth](https://user-images.githubusercontent.com/4129778/65734104-73478680-e09f-11e9-86dd-22e80918bce5.png)

[CodePen]()

### Data Structure

A data point has to have a `.feature` property containing the feature to render.

[TopoJson](https://github.com/topojson) is packaged with this plugin to convert data, it is exposed as `ChartGeo.topojson` in the global context.

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
      backgroundColor: (context) => {
        const value = context.dataset.data[context.dataIndex];
        return new Color('steelblue').lightness(value.value * 100).rgbString();
      },
      data: [
        {
          value: 0.4,
          feature: alaska // ... the feature to render
        },
        {
          value: 0.3,
          feaure: california
        }
      ]
    }]
  },
  options: {
    // ! Only one scale is supported via the options.scale option
    scale: {
      projection: 'albersUsa' // ... projection method
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

## Bubble Map

A Bubble Map (chart type: `bubbleMap`) aka Proportional Symbol is used to render maps with dots that are scaled according to some numerical value. It is based on a regular `bubble` chart where the positioning is done using latitude and longtitude.

![Bubble Map](https://user-images.githubusercontent.com/4129778/65734563-84919280-e0a1-11e9-87ea-1692b22b1fae.png)

[CodePen]()

### Data Structure

see [Bubble Chart](https://www.chartjs.org/docs/latest/charts/bubble.html#data-structure). Alternatively to `x` and `y`, the following structure can be used:

```ts
interface IBubbleMapPoint {
  longitude: number;
  latitude: number;
  r: number;
}

```

### Styling

A regular point is used and thus supports the [Point Element](https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration) styling options. In addition, the `outline*` and `graticule*` are supported.

## Scales

A new scale `projection` is registered and used by default by Choropleth and BubbleMap. It provides just one option to specify the projection method. The available methods are the one from https://github.com/d3/d3-geo#projections. Just remove the `geo` prefix. Alternatively, the projection method instance can be directly given.

```ts
interface IProjectionScaleOptions {
  /**
   * projection method used
   * @default albertUsa
   */
  projection: string | Function;
}
```

## Building

```sh
npm install
npm run build
```

[npm-image]: https://badge.fury.io/js/chartjs-chart-geo.svg
[npm-url]: https://npmjs.org/package/chartjs-chart-geo
[github-actions-image]: https://github.com/sgratzl/chartjs-chart-geo/workflows/nodeci/badge.svg
[github-actions-url]: https://github.com/sgratzl/chartjs-chart-geo/actions
