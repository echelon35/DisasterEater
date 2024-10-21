import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, catchError, map, tap } from 'rxjs';
import { Eruption } from '../Domain/Model/eruption.model';
import { Flood } from '../Domain/Model/flood.model';
import { Earthquake } from '../Domain/Model/earthquake.model';
import { SourceService } from './source.service';
import { Source } from 'src/Domain/Model/source.model';
import { Hurricane } from 'src/Domain/Model/hurricane.model';
import { CloudWatchService } from './cloudwatch.service';

@Injectable()
export class GdacsService {
  source: Source;
  sourceName = 'GDACS';

  constructor(
    private readonly httpService: HttpService,
    private readonly sourceService: SourceService,
    private readonly cloudWatchService: CloudWatchService,
  ) {
    this.defineGdacsSource();
  }

  /**
   * Search the corresponding source to associate
   */
  async defineGdacsSource(): Promise<void> {
    this.source = await this.sourceService.findOneByName(this.sourceName);
  }

  convertDataToSeisme(earthquakes: any): Earthquake[] {
    const seismeList: Earthquake[] = [];

    if (this.source == null) {
      this.cloudWatchService.logToCloudWatch(
        'Earthquake',
        `Warning, it seems that there\'s no source corresponding to ${this.sourceName} _
        earthquake list from ${this.sourceName} will be empty`,
      );
      return seismeList;
    }

    earthquakes
      .filter((item) => item.geometry?.type == 'Point')
      .forEach((element) => {
        const seisme = new Earthquake();
        seisme.dernier_releve = new Date(element.properties?.todate + 'Z');
        seisme.premier_releve = new Date(element.properties?.fromdate + 'Z');
        seisme.magnitude = element.properties?.severitydata?.severity;
        seisme.type_magnitude = element.properties?.severitydata?.severityUnit;
        seisme.idFromSource = element.properties?.eventid;
        seisme.source = this.source;
        //No data from GDACS for felt
        seisme.nb_ressenti = 0;
        seisme.lien_source = element.properties?.url?.details;
        seisme.point = element.geometry;
        seismeList.push(seisme);
      });

    return seismeList;
  }

  convertDataToFlood(floods: any): Flood[] {
    const inondationList: Flood[] = [];

    if (this.source == null) {
      this.cloudWatchService.logToCloudWatch(
        'Flood',
        `Warning, it seems that there\'s no source corresponding to ${this.sourceName} _
        flood list from ${this.sourceName} will be empty`,
      );
      return inondationList;
    }

    //Filter objects without mandatories attributes
    floods = floods.filter(
      (item) =>
        item.geometry != null &&
        item.properties?.eventid != null &&
        item.properties?.fromdate != null &&
        item.properties?.todate != null &&
        item.properties?.polygonlabel != null &&
        item.properties?.eventtype == 'FL',
    );

    floods
      .filter((item) => item.properties?.polygonlabel === 'Centroid')
      .forEach((element) => {
        const inondation = new Flood();
        inondation.dernier_releve = new Date(element.properties?.todate + 'Z');
        inondation.premier_releve = new Date(
          element.properties?.fromdate + 'Z',
        );
        inondation.point = element.geometry;
        inondation.idFromSource = element.properties?.eventid?.toString();
        inondation.source = this.source;
        inondation.lien_source = element.properties?.url?.details;
        inondationList.push(inondation);
      });

    //Surface associated with flood
    floods
      .filter((item) => item.properties?.polygonlabel === 'Affected area')
      .forEach((element) => {
        for (const obj of inondationList) {
          if (obj.idFromSource == element.properties?.eventid) {
            obj.surface = element.geometry;
          }
        }
      });

    return inondationList;
  }

  convertDataToEruption(volcanoes: any): Eruption[] {
    const volcanoesList: Eruption[] = [];

    if (this.source == null) {
      const log = `Warning, it seems that there\'s no source corresponding to ${this.sourceName} _
        eruption list from ${this.sourceName} will be empty`;
      this.cloudWatchService.logToCloudWatch('Eruption', log);
      console.log(log);
      return volcanoesList;
    }

    //Filter objects without mandatories attributes
    volcanoes = volcanoes.filter(
      (item) =>
        item.geometry != null &&
        item.properties?.fromdate != null &&
        item.properties?.eventid != null &&
        item.properties?.todate != null &&
        item.properties?.polygonlabel != null &&
        item.properties?.eventtype === 'VO',
    );

    volcanoes
      .filter((item) => item.properties?.polygonlabel === 'Centroid')
      .forEach((element) => {
        const eruption = new Eruption();
        eruption.dernier_releve = new Date(element.properties?.todate + 'Z');
        eruption.premier_releve = new Date(element.properties?.fromdate + 'Z');
        eruption.point = element.geometry;
        eruption.idFromSource = element.properties?.eventid?.toString();
        eruption.source = this.source;
        volcanoesList.push(eruption);
      });

    return volcanoesList;
  }

  convertDataToHurricane(hurricanes: any): Hurricane[] {
    const hurricanesList: Hurricane[] = [];

    if (this.source == null) {
      const log = `Warning, it seems that there\'s no source corresponding to ${this.sourceName} _
        hurricane list from ${this.sourceName} will be empty`;
      this.cloudWatchService.logToCloudWatch('Hurricane', log);
      console.log(log);
      return hurricanesList;
    }

    //Filter objects without mandatories attributes
    hurricanes = hurricanes.filter(
      (item) =>
        item.geometry != null &&
        item.properties?.eventid != null &&
        item.properties?.eventname != null &&
        item.properties?.fromdate != null &&
        item.properties?.todate != null &&
        item.properties?.polygonlabel != null &&
        item.properties?.eventtype == 'TC',
    );

    const hurricanesCopy = hurricanes;

    hurricanes
      .filter((item) => item.properties?.polygonlabel === 'Centroid')
      .forEach((element) => {
        const hurricane = new Hurricane();
        hurricane.dernier_releve = new Date(element.properties?.todate + 'Z');
        hurricane.premier_releve = new Date(element.properties?.fromdate + 'Z');
        hurricane.point = element.geometry;
        hurricane.idFromSource = element.properties?.eventid?.toString();
        hurricane.lien_source = element.properties?.url?.details;
        hurricane.source = this.source;
        hurricane.name = element.properties?.eventname;
        hurricanesList.push(hurricane);

        /**Path of hurricane */
        const path = hurricanesCopy
          .filter(
            (pathElement) =>
              pathElement.properties.eventid?.toString() ==
                hurricane.idFromSource &&
              pathElement.geometry.type === 'LineString',
          )
          .map((item) => item.geometry);

        //Convert the path from geojson into MultiLineString Object
        if (path.length > 0) {
          const coordinatesArray = path.map((item) => item.coordinates);
          hurricane.path = {
            type: 'MultiLineString',
            coordinates: coordinatesArray,
          };
        }

        /** Forecast */
        const prevision = hurricanesCopy.filter(
          (prevItem) =>
            prevItem.properties?.eventid?.toString() ===
              hurricane.idFromSource &&
            prevItem.geometry?.type === 'Polygon' &&
            prevItem.properties?.polygonlabel === 'Uncertainty Cones',
        );
        //Convert the forecast from geojson into Polygon Object
        if (prevision.length > 0) {
          const coordinatesArray = prevision.map(
            (item) => item.geometry.coordinates,
          );
          hurricane.forecast = {
            type: 'Polygon',
            coordinates: coordinatesArray[0],
          };
        }

        /** Surface */
        const surface = hurricanesCopy.filter(
          (surfaceItem) =>
            surfaceItem.properties?.eventid?.toString() ===
              hurricane.idFromSource &&
            surfaceItem.geometry.type === 'Polygon' &&
            (surfaceItem.properties.Class === 'Poly_Green' ||
              surfaceItem.properties.Class === 'Poly_Orange' ||
              surfaceItem.properties.Class === 'Poly_Red'),
        );

        if (surface.length > 0) {
          const coordinatesArray = surface.map(
            (item) => item.geometry.coordinates,
          );
          hurricane.surface = {
            type: 'MultiPolygon',
            coordinates: coordinatesArray,
          };
        }
      });

    return hurricanesList;
  }

  getEarthquakeData(): Observable<Earthquake[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=EQ';

    return this.httpService.get(apiUrl, { timeout: 30000 }).pipe(
      tap(() => console.log('Appel HTTP envoyé avec succès')),
      map((response: AxiosResponse) => {
        const data = response.data;
        const seismes = data.features || [];
        console.log(seismes.length + ' séismes remontés par le GDACS');
        return this.convertDataToSeisme(seismes);
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getHurricaneData(): Observable<Hurricane[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=TC';
    console.log(apiUrl);

    return this.httpService.get(apiUrl).pipe(
      tap(() => console.log('Appel HTTP envoyé avec succès')),
      map((response: AxiosResponse) => {
        const data = response.data;
        const hurricanes = data.features || [];
        return this.convertDataToHurricane(hurricanes);
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getEruptionData(): Observable<Eruption[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=VO';
    console.log(apiUrl);

    return this.httpService.get(apiUrl).pipe(
      tap(() => console.log('Appel HTTP envoyé avec succès')),
      map((response: AxiosResponse) => {
        const data = response.data;
        const volcanoes = data.features || [];
        return this.convertDataToEruption(volcanoes);
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getFloodData(): Observable<Flood[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=FL';

    console.log(apiUrl);

    return this.httpService.get(apiUrl).pipe(
      tap(() => console.log('Appel HTTP envoyé avec succès')),
      map((response: AxiosResponse) => {
        const data = response.data;
        const floods = data.features || [];
        return this.convertDataToFlood(floods);
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }
}
