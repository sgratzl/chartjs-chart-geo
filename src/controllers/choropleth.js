import { defaults, helpers } from 'chart.js';
import { geoDefaults, Geo } from './geo';
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
          type: 'color',
        },
      },
      elements: {
        geoFeature: {
          backgroundColor(context) {
            if (context.dataIndex == null) {
              return null;
            }
            const controller = context.chart.getDatasetMeta(context.datasetIndex).controller;
            return controller.valueToColor(context.dataIndex);
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
    meta.vAxisID = meta.rAxisID = 'color';
    dataset.vAxisID = dataset.rAxisID = 'color';
    meta.rScale = this.getScaleForId('color');
    meta.vScale = meta.rScale;
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID;
  }

  parse(start, count) {
    const rScale = this.getMeta().rScale;
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    for (let i = start; i < start + count; ++i) {
      meta._parsed[i] = {
        [rScale.axis]: rScale.parse(data[i]),
      };
    }
  }

  valueToColor(index) {
    const rScale = this.getMeta().rScale;
    return rScale.getColorForValue(this.getParsed(index)[rScale.axis]);
  }
}

Choropleth.prototype.dataElementType = GeoFeature;
Geo.prototype.dataElementOptions = ['backgroundColor', 'borderColor', 'borderWidth'];
