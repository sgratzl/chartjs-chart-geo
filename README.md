# Chart.js Geo

[![NPM Package][npm-image]][npm-url] [![Github Actions][github-actions-image]][github-actions-url]

Chart.js module for charting maps with legends. Adding new chart types: `choropleth` and `bubbleMap`.

**Works only with Chart.js >= 3.0.0-alpha.2**

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

see https://github.com/sgratzl/chartjs-chart-geo/blob/develop/src/controllers/geo.ts#L213

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

see https://github.com/sgratzl/chartjs-chart-geo/blob/develop/src/elements/geoFeature.ts#L5

### Legend and Color Scale

The coloring of the nodes will be done with a special color scale. The scale itself is based on a linear scale.

see

- https://github.com/sgratzl/chartjs-chart-geo/blob/develop/src/scales/base.ts#L3
- https://github.com/sgratzl/chartjs-chart-geo/blob/develop/src/scales/color.ts#L114

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

see

- https://github.com/sgratzl/chartjs-chart-geo/blob/develop/src/scales/base.ts#L3
- https://github.com/sgratzl/chartjs-chart-geo/blob/develop/src/scales/size.ts#L15

## Scales

A new scale `projection` is registered and used by default by Choropleth and BubbleMap. It provides just one option to specify the projection method. The available methods are the one from https://github.com/d3/d3-geo#projections. Just remove the `geo` prefix. Alternatively, the projection method instance can be directly given.

see https://github.com/sgratzl/chartjs-chart-geo/blob/develop/src/scales/projection.ts#L49

### ESM and Tree Shaking

The ESM build of the library supports tree shaking thus having no side effects. As a consequence the chart.js library won't be automatically manipulated nor new controllers automatically registered. One has to manually import and register them.

Variant A:

```js
import { Chart } from 'chart.js';
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
cat .yarnrc_patch.yml >> .yarnrc.yml
yarn
yarn pnpify --sdk
```

### Common commands

```sh
yarn compile
yarn test
yarn lint
yarn fix
yarn build
yarn docs
yarn release
yarn release:pre
```

[npm-image]: https://badge.fury.io/js/chartjs-chart-geo.svg
[npm-url]: https://npmjs.org/package/chartjs-chart-geo
[github-actions-image]: https://github.com/sgratzl/chartjs-chart-geo/workflows/ci/badge.svg
[github-actions-url]: https://github.com/sgratzl/chartjs-chart-geo/actions
[codepen]: https://img.shields.io/badge/CodePen-open-blue?logo=codepen
