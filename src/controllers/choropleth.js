import { defaults, helpers } from 'chart.js';
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
          display: false,
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
    meta.vScale = wrapProjectionScale(meta.xScale, meta.rScale.options.property);
    meta.iScale = meta.xScale;
    meta.iAxisID = dataset.iAxisID = meta.xAxisID;
  }

  parse(start, count) {
    const rScale = this.getMeta().rScale;
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    let i, ilen;
    for (i = start, ilen = start + count; i < ilen; ++i) {
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
