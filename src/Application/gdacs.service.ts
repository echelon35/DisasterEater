import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, catchError, map } from 'rxjs';
import { Eruption } from '../Domain/Model/eruption.model';
import { Inondation } from '../Domain/Model/inondation.model';
import { Earthquake } from '../Domain/Model/earthquake.model';
import { Cyclone } from '../Domain/Model/cyclone.model';
import { SourceService } from './source.service';
import { Source } from 'src/Domain/Model/source.model';
// import * as moment from 'moment';

@Injectable()
export class GdacsService {
  source: Source;

  constructor(
    private readonly httpService: HttpService,
    private readonly sourceService: SourceService,
  ) {
    this.defineGdacsSource();
  }

  async defineGdacsSource(): Promise<void> {
    this.source = await this.sourceService.findOneByName('GDACS');
  }

  convertDataToSeisme(earthquakes: any): Earthquake[] {
    const seismeList: Earthquake[] = [];

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
        seisme.nb_ressenti = element.properties?.felt;
        seisme.point = element.geometry;
        seismeList.push(seisme);
      });

    return seismeList;
  }

  convertDataToInondation(floods: any): Inondation[] {
    const inondationList: Inondation[] = [];

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
        const inondation = new Inondation();
        inondation.dernier_releve = new Date(element.properties?.todate + 'Z');
        inondation.premier_releve = new Date(
          element.properties?.fromdate + 'Z',
        );
        inondation.point = element.geometry;
        inondation.idFromSource = element.properties?.eventid?.toString();
        inondation.source = this.source;
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

    //Filter objects without mandatories attributes
    volcanoes = volcanoes.filter(
      (item) =>
        item.geometry != null &&
        item.properties?.fromdate != null &&
        item.properties?.eventid != null &&
        item.properties?.todate != null &&
        item.properties?.polygonlabel != null &&
        item.properties?.eventtype == 'VO',
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

    //Surface associated
    volcanoes
      .filter((item) => item.properties?.polygonlabel === 'OBS')
      .forEach((element) => {
        for (const obj of volcanoesList) {
          if (obj.idFromSource == element.properties?.eventid) {
            obj.surface = element.geometry;
          }
        }
      });

    return volcanoesList;
  }

  convertDataToCyclone(hurricanes: any): Cyclone[] {
    const hurricanesList: Cyclone[] = [];

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

    hurricanes
      .filter((item) => item.properties?.polygonlabel === 'Centroid')
      .forEach((element) => {
        const cyclone = new Cyclone();
        cyclone.dernier_releve = new Date(element.properties?.todate + 'Z');
        cyclone.premier_releve = new Date(element.properties?.fromdate + 'Z');
        cyclone.point = element.geometry;
        cyclone.idFromSource = element.properties?.eventid?.toString();
        cyclone.source = this.source;
        hurricanesList.push(cyclone);
      });

    //Surface associated
    hurricanes
      .filter((item) => item.properties?.polygonlabel === 'OBS')
      .forEach((element) => {
        for (const obj of hurricanesList) {
          if (obj.idFromSource == element.properties?.eventid) {
            obj.surface = element.geometry;
          }
        }
      });

    return hurricanesList;
  }

  getEarthquakeData(): Observable<Earthquake[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=EQ';

    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const seismes = data.features || [];
        return this.convertDataToSeisme(seismes);
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getCycloneData(): Observable<Cyclone[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=TC';

    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const hurricanes = data.features || [];
        return this.convertDataToCyclone(hurricanes);
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getEruptionData(): Observable<Eruption[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=VO';

    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const volcanoes = data.features || [];
        return this.convertDataToEruption(volcanoes);
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getInondationData(): Observable<Inondation[]> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=FL';

    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const floods = data.features || [];
        return this.convertDataToInondation(floods);
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }
}
