import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, catchError, map } from 'rxjs';
import { Eruption } from '../Domain/Model/eruption.model';
import { Inondation } from '../Domain/Model/inondation.model';
import { Seisme } from '../Domain/Model/seisme.model';
// import * as moment from 'moment';

@Injectable()
export class GdacsService {
  constructor(private readonly httpService: HttpService) {}

  convertDataToSeisme(earthquakes: any): Seisme[] {
    const seismeList: Seisme[] = [];

    earthquakes
      .filter((item) => item.geometry.type == 'Point')
      .forEach((element) => {
        const seisme = new Seisme();
        seisme.dernier_releve = new Date(element.properties?.todate + 'Z');
        seisme.premier_releve = new Date(element.properties?.fromdate + 'Z');
        seisme.magnitude = element.properties?.severitydata?.severity;
        seisme.type_magnitude = element.properties?.severitydata?.severityUnit;
        seisme.idSource = element.properties?.eventid;
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
        inondation.idSource = element.properties?.eventid?.toString();
        inondation.sourceId = 'GDACS';
        inondationList.push(inondation);
      });

    //Surface associated with flood
    floods
      .filter((item) => item.properties?.polygonlabel === 'Affected area')
      .forEach((element) => {
        for (const obj of inondationList) {
          if (obj.idSource == element.properties?.eventid) {
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
        eruption.idSource = element.properties?.eventid?.toString();
        eruption.sourceId = 'GDACS';
        volcanoesList.push(eruption);
      });

    //Surface associated
    volcanoes
      .filter((item) => item.properties?.polygonlabel === 'OBS')
      .forEach((element) => {
        for (const obj of volcanoesList) {
          if (obj.idSource == element.properties?.eventid) {
            obj.surface = element.geometry;
          }
        }
      });

    return volcanoesList;
  }

  getEarthquakeData(): Observable<AxiosResponse<any>> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=EQ';
    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const earthquakes = data.features || [];
        return earthquakes;
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getInondationData(): Observable<AxiosResponse<any>> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=FL';
    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const floods = data.features || [];
        return floods;
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getCycloneData(): Observable<AxiosResponse<any>> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=TC';
    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const cyclones = data.features || [];
        return cyclones;
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }

  getEruptionData(): Observable<AxiosResponse<any>> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=VO';
    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const volcanoes = data.features || [];
        return volcanoes;
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données GDACS : ${error.message}`,
        );
      }),
    );
  }
}
