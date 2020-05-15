import { defaults, helpers, layouts } from 'chart.js';
import { geoDefaults, Geo } from './geo';
import { wrapProjectionScale } from '../scales';
import { GeoFeature } from '../elements';

defaults.set(
  'choropleth',
  helpers.merge({}, [
    geoDefaults,
    {
      hover: {
        mode: 'single',
      },
      tooltips: {
        callbacks: {
          title() {
            // Title doesn't make sense for scatter since we format the data as a point
            return '';
          },
          label(item, data) {
            if (item.value == null) {
              return data.labels[item.index];
            }
            return `${data.labels[item.index]}: ${item.value}`;
          },
        },
      },
      scales: {
        color: {
          position: 'chartArea',
          type: 'color',
        },
      },
      elements: {
        geoFeature: {
          backgroundColor(context) {
            if (context.dataIndex == null) {
              return null;
            }
            const value = context.dataset.data[context.dataIndex];
            const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
            return controller.valueToColor(value);
          },
        },
      },
    },
  ])
);

export class Choropleth extends Geo {
  linkScales() {
    super.linkScales();
    const dataset = this.getDataset();
    const meta = this.getMeta();
    meta.iAxisID = dataset.vAxisID = 'color';
    meta.cScale = this.getScaleForId('color');
    meta.vScale = meta.cScale ? wrapProjectionScale(meta.xScale, meta.cScale.options.property) : meta.xScale;
    meta.iScale = meta.vScale;
  }

  valueToColor(value) {
    const cScale = this.getMeta().cScale;
    return cScale ? cScale.getColorForValue(value) : 'blue';
  }
}

Choropleth.prototype.dataElementType = GeoFeature;
Geo.prototype.dataElementOptions = ['backgroundColor', 'borderColor', 'borderWidth'];
