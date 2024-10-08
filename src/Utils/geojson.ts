export class GeoJSON {
  version = '0.5.0';
  private geomAttrs = [];
  private geoms = [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeoJSON',
  ];

  // Allow user to specify default parameters
  default: object = {
    doThrows: {
      invalidGeometry: false,
    },
  };

  constructor() {}

  InvalidGeometryError(...arguments_arr: any[]): Error {
    const args =
      1 <= arguments_arr.length ? [].slice.call(arguments_arr, 0) : [];
    const item = args.shift();
    const params = args.shift();

    throw Error(
      'Invalid Geometry: ' +
        'item: ' +
        JSON.stringify(item) +
        ', params: ' +
        JSON.stringify(params),
    );
  }

  errors: object = {
    InvalidGeometryError: this.InvalidGeometryError,
  };

  public isGeometryValid = function (geometry: any): boolean {
    if (!geometry || !Object.keys(geometry).length) {
      return false;
    }
  };

  public parse(objects: [] | object, params: object, callback?: Function): any {
    let geojson;
    const settings = this.applyDefaults(params, this.default);

    this.geomAttrs.length = 0; // Reset the list of geometry fields
    this.setGeom(settings);
    const propFunc = this.getPropFunction(settings);

    if (Array.isArray(objects)) {
      geojson = { type: 'FeatureCollection', features: [] };
      objects.forEach(function (item) {
        geojson.features.push(
          this.getFeature({ item: item, params: settings, propFunc: propFunc }),
        );
      }, this);
      this.addOptionals(geojson, settings);
    } else {
      geojson = this.getFeature({
        item: objects,
        params: settings,
        propFunc: propFunc,
      });
      this.addOptionals(geojson, settings);
    }

    if (callback && typeof callback === 'function') {
      callback(geojson);
    } else {
      return geojson;
    }
  }

  // Adds default settings to user-specified params
  // Does not overwrite any settings--only adds defaults
  // the the user did not specify
  private applyDefaults(params: object, defaults: object): object {
    const settings = params || {};

    for (const setting in settings) {
      if (defaults.hasOwnProperty(setting) && !settings[setting]) {
        settings[setting] = defaults[setting];
      }
    }

    return settings;
  }

  // Adds the optional GeoJSON properties crs and bbox
  // if they have been specified
  private addOptionals(geojson, settings) {
    if (settings.crs && this.checkCRS(settings.crs)) {
      if (settings.isPostgres) {
        geojson.geometry.crs = settings.crs;
      } else {
        geojson.crs = settings.crs;
      }
    }
    if (settings.bbox) {
      geojson.bbox = settings.bbox;
    }
    if (settings.extraGlobal) {
      geojson.properties = {};
      for (const key in settings.extraGlobal) {
        geojson.properties[key] = settings.extraGlobal[key];
      }
    }
  }

  // Verify that the structure of CRS object is valid
  private checkCRS(crs): boolean {
    if (crs.type === 'name') {
      if (crs.properties && crs.properties.name) {
        return true;
      } else {
        throw new Error('Invalid CRS. Properties must contain "name" key');
      }
    } else if (crs.type === 'link') {
      if (crs.properties && crs.properties.href && crs.properties.type) {
        return true;
      } else {
        throw new Error(
          'Invalid CRS. Properties must contain "href" and "type" key',
        );
      }
    } else {
      throw new Error('Invald CRS. Type attribute must be "name" or "link"');
    }
  }

  // Moves the user-specified geometry parameters
  // under the `geom` key in param for easier access
  private setGeom(params: any): void {
    params.geom = {};

    for (const param in params) {
      if (params.hasOwnProperty(param) && this.geoms.indexOf(param) !== -1) {
        params.geom[param] = params[param];
        delete params[param];
      }
    }

    this.setGeomAttrList(params.geom);
  }

  // Adds fields which contain geometry data
  // to geomAttrs. This list is used when adding
  // properties to the features so that no geometry
  // fields are added the properties key
  private setGeomAttrList(params: any): void {
    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        if (typeof params[param] === 'string') {
          this.geomAttrs.push(params[param]);
        } else if (typeof params[param] === 'object') {
          // Array of coordinates for Point
          this.geomAttrs.push(params[param][0]);
          this.geomAttrs.push(params[param][1]);
        }
      }
    }

    if (this.geomAttrs.length === 0) {
      throw new Error('No geometry attributes specified');
    }
  }

  // Creates a feature object to be added
  // to the GeoJSON features array
  private getFeature(args): object {
    const item = args.item,
      params = args.params,
      propFunc = args.propFunc;

    const feature = { type: 'Feature' };

    const that = this;

    feature['geometry'] = this.buildGeom(item, params);
    feature['properties'] = propFunc.call(item, that);

    return feature;
  }

  private isNested(val) {
    return /^.+\..+$/.test(val);
  }

  // Assembles the `geometry` property
  // for the feature output
  private buildGeom(item, params): any {
    let geom = {};
    //   attr;

    for (const gtype in params.geom) {
      const val = params.geom[gtype];

      // Geometry parameter specified as: {Point: 'coords'}
      if (typeof val === 'string' && item.hasOwnProperty(val)) {
        if (gtype === 'GeoJSON') {
          geom = item[val];
        } else {
          geom['type'] = gtype;
          geom['coordinates'] = item[val];
        }
      } else if (typeof val === 'object' && !Array.isArray(val)) {
        /* Handle things like:
          Polygon: {
            northeast: ['lat', 'lng'],
            southwest: ['lat', 'lng']
          }
          */
        /*jshint loopfunc: true */
        const points = Object.keys(val).map(function (key) {
          const order = val[key];
          const newItem = item[key];
          return this.buildGeom(newItem, { geom: { Point: order } });
        });
        geom['type'] = gtype;
        /*jshint loopfunc: true */
        geom['coordinates'] = [].concat(
          points.map(function (p) {
            return p.coordinates;
          }),
        );
      } else if (
        // Geometry parameter specified as: {Point: ['lat', 'lng', 'alt']}
        Array.isArray(val) &&
        item.hasOwnProperty(val[0]) &&
        item.hasOwnProperty(val[1]) &&
        item.hasOwnProperty(val[2])
      ) {
        geom['type'] = gtype;
        geom['coordinates'] = [
          Number(item[val[1]]),
          Number(item[val[0]]),
          Number(item[val[2]]),
        ];
      } else if (
        // Geometry parameter specified as: {Point: ['lat', 'lng']}
        Array.isArray(val) &&
        item.hasOwnProperty(val[0]) &&
        item.hasOwnProperty(val[1])
      ) {
        geom['type'] = gtype;
        geom['coordinates'] = [Number(item[val[1]]), Number(item[val[0]])];
      } else if (
        // Geometry parameter specified as: {Point: ['container.lat', 'container.lng', 'container.alt']}
        Array.isArray(val) &&
        this.isNested(val[0]) &&
        this.isNested(val[1]) &&
        this.isNested(val[2])
      ) {
        const coordinates = [];
        for (let i = 0; i < val.length; i++) {
          // i.e. 0 and 1
          const paths = val[i].split('.');
          let itemClone = item;
          for (let j = 0; j < paths.length; j++) {
            if (!itemClone.hasOwnProperty(paths[j])) {
              return false;
            }
            itemClone = itemClone[paths[j]]; // Iterate deeper into the object
          }
          coordinates[i] = itemClone;
        }
        geom['type'] = gtype;
        geom['coordinates'] = [
          Number(coordinates[1]),
          Number(coordinates[0]),
          Number(coordinates[2]),
        ];
      }

      // Geometry parameter specified as: {Point: ['container.lat', 'container.lng']}
      else if (
        Array.isArray(val) &&
        this.isNested(val[0]) &&
        this.isNested(val[1])
      ) {
        const coordinates = [];
        for (let i = 0; i < val.length; i++) {
          // i.e. 0 and 1
          const paths = val[i].split('.');
          let itemClone = item;
          for (let j = 0; j < paths.length; j++) {
            if (!itemClone.hasOwnProperty(paths[j])) {
              return false;
            }
            itemClone = itemClone[paths[j]]; // Iterate deeper into the object
          }
          coordinates[i] = itemClone;
        }
        geom['type'] = gtype;
        geom['coordinates'] = [Number(coordinates[1]), Number(coordinates[0])];
      } else if (
        // Geometry parameter specified as: {Point: [{coordinates: [lat, lng]}]}
        Array.isArray(val) &&
        val[0].constructor.name === 'Object' &&
        Object.keys(val[0])[0] === 'coordinates'
      ) {
        geom['type'] = gtype;
        geom['coordinates'] = [
          Number(item.coordinates[val[0].coordinates.indexOf('lng')]),
          Number(item.coordinates[val[0].coordinates.indexOf('lat')]),
        ];
      }
    }

    if (
      params.doThrows &&
      params.doThrows.invalidGeometry &&
      !this.isGeometryValid(geom)
    ) {
      throw this.InvalidGeometryError(item, params);
    }

    return geom;
  }

  // Returns the function to be used to
  // build the properties object for each feature
  private getPropFunction(params) {
    let func;

    if (!params.exclude && !params.include) {
      func = function (properties, that) {
        for (const attr in this) {
          if (
            this.hasOwnProperty(attr) &&
            that.geomAttrs.indexOf(attr) === -1
          ) {
            properties[attr] = this[attr];
          }
        }
      };
    } else if (params.include) {
      func = function (properties, that) {
        params.include.forEach(function (attr) {
          properties[attr] = this[attr];
        }, this);
      };
    } else if (params.exclude) {
      func = function (properties, that) {
        for (const attr in this) {
          if (
            this.hasOwnProperty(attr) &&
            that.geomAttrs.indexOf(attr) === -1 &&
            params.exclude.indexOf(attr) === -1
          ) {
            properties[attr] = this[attr];
          }
        }
      };
    }

    return function (that) {
      const properties = {};

      func.call(this, properties, that);

      if (params.extra) {
        this.addExtra(properties, params.extra);
      }
      return properties;
    };
  }

  // Adds data contained in the `extra`
  // parameter if it has been specified
  private addExtra(properties, extra) {
    for (const key in extra) {
      if (extra.hasOwnProperty(key)) {
        properties[key] = extra[key];
      }
    }

    return properties;
  }
}

const geo = new GeoJSON();
const data = {
  name: 'Location A',
  category: 'Store',
  street: 'Market',
  lat: 39.984,
  lng: -75.343,
};

const res = geo.parse(data, { Point: ['lat', 'lng'] });
const res1 = geo.parse(data, { Point: ['lat', 'lng'] });

console.log(res);

console.log(res1);

console.log('end');
