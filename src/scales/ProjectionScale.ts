import { Scale, CoreScaleOptions } from 'chart.js';
import {
  geoPath,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoGnomonic,
  geoOrthographic,
  geoStereographic,
  geoEqualEarth,
  geoAlbers,
  geoAlbersUsa,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEquirectangular,
  geoMercator,
  geoTransverseMercator,
  geoNaturalEarth1,
  GeoProjection,
  GeoPath,
  GeoPermissibleObjects,
  ExtendedFeatureCollection,
  ExtendedFeature,
  GeoGeometryObjects,
  ExtendedGeometryCollection,
} from 'd3-geo';

const lookup: { [key: string]: () => GeoProjection } = {
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoGnomonic,
  geoOrthographic,
  geoStereographic,
  geoEqualEarth,
  geoAlbers,
  geoAlbersUsa,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEquirectangular,
  geoMercator,
  geoTransverseMercator,
  geoNaturalEarth1,
};
Object.keys(lookup).forEach((key) => {
  lookup[`${key.charAt(3).toLowerCase()}${key.slice(4)}`] = lookup[key];
});

export interface IProjectionScaleOptions extends CoreScaleOptions {
  /**
   * projection method used
   * @default albersUsa
   */
  projection:
    | GeoProjection
    | 'azimuthalEqualArea'
    | 'azimuthalEquidistant'
    | 'gnomonic'
    | 'orthographic'
    | 'stereographic'
    | 'equalEarth'
    | 'albers'
    | 'albersUsa'
    | 'conicConformal'
    | 'conicEqualArea'
    | 'conicEquidistant'
    | 'equirectangular'
    | 'mercator'
    | 'transverseMercator'
    | 'naturalEarth1';

  /**
   * extra scale factor applied to projection
   */
  projectionScale: number;
  /**
   * extra offset applied after projection
   */
  projectionOffset: [number, number];
  /**
   * padding applied during auto scaling of the map in pixels
   * i.e. the chart size is reduce by the padding before fitting the map
   */
  padding: number | { top: number; left: number; right: number; bottom: number };
}

export class ProjectionScale extends Scale<IProjectionScaleOptions> {
  readonly geoPath: GeoPath<any, GeoPermissibleObjects>;

  projection!: GeoProjection;

  private outlineBounds: {
    refX: number;
    refY: number;
    refScale: number;
    width: number;
    height: number;
    aspectRatio: number;
  } | null = null;

  private oldChartBounds: { chartWidth: number; chartHeight: number } | null = null;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(cfg: any) {
    super(cfg);
    this.geoPath = geoPath();
  }

  init(options: IProjectionScaleOptions): void {
    // eslint-disable-next-line no-param-reassign
    (options as any).position = 'chartArea';
    super.init(options);
    if (typeof options.projection === 'function') {
      this.projection = options.projection;
    } else {
      this.projection = (lookup[options.projection] || lookup.albersUsa)();
    }
    this.geoPath.projection(this.projection);

    this.outlineBounds = null;
    this.oldChartBounds = null;
  }

  computeBounds(outline: ExtendedFeature): void;
  computeBounds(outline: ExtendedFeatureCollection): void;
  computeBounds(outline: GeoGeometryObjects): void;
  computeBounds(outline: ExtendedGeometryCollection): void;
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  computeBounds(outline: any): void {
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
      refY: t[1],
    };
  }

  updateBounds(): boolean {
    const area = this.chart.chartArea;

    const bb = this.outlineBounds;

    if (!bb) {
      return false;
    }
    const padding = this.options.padding;
    const paddingTop = typeof padding === 'number' ? padding : padding.top;
    const paddingLeft = typeof padding === 'number' ? padding : padding.left;
    const paddingBottom = typeof padding === 'number' ? padding : padding.bottom;
    const paddingRight = typeof padding === 'number' ? padding : padding.right;

    const chartWidth = area.right - area.left - paddingLeft - paddingRight;
    const chartHeight = area.bottom - area.top - paddingTop - paddingBottom;

    const bak = this.oldChartBounds;
    this.oldChartBounds = {
      chartWidth,
      chartHeight,
    };

    const scale = Math.min(chartWidth / bb.width, chartHeight / bb.height);
    const viewWidth = bb.width * scale;
    const viewHeight = bb.height * scale;

    const x = (chartWidth - viewWidth) * 0.5 + area.left + paddingLeft;
    const y = (chartHeight - viewHeight) * 0.5 + area.top + paddingTop;

    // this.mapScale = scale;
    // this.mapTranslate = {x, y};

    const o = this.options;

    this.projection
      .scale(bb.refScale * scale * o.projectionScale)
      .translate([scale * bb.refX + x + o.projectionOffset[0], scale * bb.refY + y + o.projectionOffset[1]]);

    return (
      !bak || bak.chartWidth !== this.oldChartBounds.chartWidth || bak.chartHeight !== this.oldChartBounds.chartHeight
    );
  }

  static readonly id = 'projection';

  static readonly defaults: Partial<IProjectionScaleOptions> = {
    projection: 'albersUsa',
    projectionScale: 1,
    projectionOffset: [0, 0],
    padding: 0,
  };

  static readonly descriptors = /* #__PURE__ */ {
    _scriptable: (name: keyof IProjectionScaleOptions): boolean => name !== 'projection',
    _indexable: (name: keyof IProjectionScaleOptions): boolean => name !== 'projectionOffset',
  };
}

declare module 'chart.js' {
  export interface ProjectionScaleTypeRegistry {
    projection: {
      options: IProjectionScaleOptions;
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ScaleTypeRegistry extends ProjectionScaleTypeRegistry {}
}
