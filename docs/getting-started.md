---
title: Getting Started
---

Chart.js module for charting maps with legends. Adding new chart types: `choropleth` and `bubbleMap`.

![Choropleth](https://user-images.githubusercontent.com/4129778/78821942-8b974700-79da-11ea-988d-142f7788ffe6.png)

[CodePen](https://codepen.io/sgratzl/pen/gOaBQep)

![Earth Choropleth](https://user-images.githubusercontent.com/4129778/78821946-8d610a80-79da-11ea-9ebb-23baca9db670.png)

[CodePen](https://codepen.io/sgratzl/pen/bGVmQKw)

![Bubble Map](https://user-images.githubusercontent.com/4129778/78821935-89cd8380-79da-11ea-81bf-842fcbd3eff4.png)

[CodePen](https://codepen.io/sgratzl/pen/YzyJRvm)

works great with https://github.com/chartjs/chartjs-plugin-datalabels

## Install

```sh
npm install chart.js chartjs-chart-geo
```

## Usage

see [Examples](./examples/)

CodePens

- [Choropleth](https://codepen.io/sgratzl/pen/gOaBQep)
- [Earth Choropleth](https://codepen.io/sgratzl/pen/bGVmQKw)
- [Bubble Map](https://codepen.io/sgratzl/pen/YzyJRvm)

## Choropleth

A choropleth map is a geo visualization where the area of a geometric feature encodes a value. For example [Choropleth](./examples/choropleth.md).

::: warning
This plugin is _not_ providing the geometric data files (like GeoJson or TopoJson) but they need to manually imported and defined.
:::

Each data point is an object with a feature and a corresponding value. see also [IChoroplethDataPoint](/api/interfaces/interface.IChoroplethDataPoint.html)

### Configuration

The controller has the following options [IChoroplethControllerDatasetOptions](/api/interfaces/interface.IChoroplethControllerDatasetOptions.html).
In addition, the projection of the geometric feature to the pixel space is defined in the `projection` scale. see [IProjectionScaleOptions](/api/interfaces/interface.IProjectionScaleOptions.html) for available options. The conversion from a value to a color is performed by the `color` scale. see [IColorScaleOptions](/api/interfaces/interface.IColorScaleOptions.html) for available options.

## Bubble Map

A bubble is using the area / radius of a circle to encode a value at a specific latitude / longitude. For example [BubbleMap](./examples/bubbleMap.md). Therefore, a data point has to look like this [IBubbleMapDataPoint](/api/interfaces/interface.IBubbleMapDataPoint.html).

### Configuration

The controller has the following options [IBubbleMapControllerDatasetOptions](/api/interfaces/interface.IBubbleMapControllerDatasetOptions.html).
In addition, the projection of the geometric feature to the pixel space is defined in the `projection` scale. see [IProjectionScaleOptions](/api/interfaces/interface.IProjectionScaleOptions.html) for available options. The conversion from a value to a radius / area is performed by the `size` scale. see [ISizeScaleOptions](/api/interfaces/interface.ISizeScaleOptions.html) for available options.
