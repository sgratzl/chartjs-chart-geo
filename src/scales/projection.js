'use strict';

import * as Chart from 'chart.js';
import {geoPath, geoAlbers, geoAlbersUsa, geoAzimuthalEqualArea, geoEqualEarth} from 'd3-geo';

const defaults = {
  projection: 'albersUsa'
};

const lookup = {
  albers: geoAlbers,
  albersUsa: geoAlbersUsa,
  equalEarth: geoEqualEarth,
  azimuthalEqualArea: geoAzimuthalEqualArea
};

const superClass = Chart.Scale.prototype;
export const ProjectionScale = Chart.Scale.extend({
  ticks: [],
  initialize() {
    superClass.initialize.call(this);
    this.geoPath = geoPath();
    if (typeof this.options.projection === 'function') {
      this.projection = this.options.projection();
    } else if (this.options.projection && typeof lookup[this.options.projection] === 'function') {
      this.projection = lookup[this.options.projection]();
    } else {
      this.projection = null;
    }
    this.geoPath.projection(this.projection);
  },

  computeBounds(outline) {
    const bb = geoPath(this.projection.fitWidth(1000, outline)).bounds(outline);
    const bHeight = Math.ceil(bb[1][1] - bb[0][1]);
    const bWidth = Math.ceil(bb[1][0] - bb[0][0]);
    const t = this.projection.translate();

    this.outlineBounds = {
      width: bWidth,
      height: bHeight,
      aspectRatio: bWidth / bHeight,
      refScale: this.projection.scale(),
      refX: t[0],
      refY: t[1]
    };
  },

  updateBounds() {
    const area = this.chart.chartArea;
    const bb = this.outlineBounds;

    const chartWidth = area.right - area.left;
    const chartHeight = area.bottom - area.top;

    const bak = this.oldChartBounds;
    this.oldChartBounds = {
      chartWidth,
      chartHeight
    };

    const scale = Math.min(chartWidth / bb.width, chartHeight / bb.height);
    const viewWidth = bb.width * scale;
    const viewHeight = bb.height * scale;

    const x = (chartWidth - viewWidth) * 0.5;
    const y = (chartHeight - viewHeight) * 0.5;

    // this.mapScale = scale;
    // this.mapTranslate = {x, y};

    this.projection
      .scale(bb.refScale * scale)
      .translate([scale * (bb.refX + x), scale * (bb.refY + y)]);

    return !bak
      || bak.chartWidth !== this.oldChartBounds.chartWidth
      || bak.chartHeight !== this.oldChartBounds.chartHeight;
  }
});
Chart.scaleService.registerScaleType('projection', ProjectionScale, defaults);

Object.keys(lookup).forEach((key) => {
  Chart.scaleService.registerScaleType(key, ProjectionScale, {
    projection: lookup[key]
  });
});
