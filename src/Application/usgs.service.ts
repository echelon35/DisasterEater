import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable, catchError, map } from 'rxjs';
import { Earthquake } from 'src/Domain/Model/earthquake.model';
import * as moment from 'moment';

@Injectable()
export class UsgsService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Convert the datas from USGS to Satellearth earthquakes
   * @param earthquakes
   * @returns
   */
  convertDataToSeisme(earthquakes: any): Earthquake[] {
    const seismeList: Earthquake[] = [];

    earthquakes.forEach((element: any) => {
      const earthquake = new Earthquake();
      earthquake.dernier_releve = new Date(
        moment.unix(element.properties?.time / 1000).format(),
      );
      earthquake.premier_releve = new Date(
        moment.unix(element.properties?.time / 1000).format(),
      );
      earthquake.magnitude = element.properties?.mag;
      earthquake.idSource = element.id;
      earthquake.nb_ressenti = element.properties?.felt;
      earthquake.point = {
        type: 'Point',
        coordinates: [
          element.geometry.coordinates[0],
          element.geometry.coordinates[1],
        ],
      };
      earthquake.type_magnitude = element.properties?.magtype;
      earthquake.sourceId = 'USGS';
      seismeList.push(earthquake);
    });

    return seismeList;
  }

  /**
   * Get the datas from the USGS API
   * @returns data from API
   */
  getEarthquakeData(): Observable<AxiosResponse<Earthquake>> {
    const magnitudeMin = 3;
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrow_format = `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`;
    const yesterday_format = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    const apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${yesterday_format}&endtime=${tomorrow_format}&minmagnitude=${magnitudeMin}`;
    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        const earthquakes = data.features || [];

        return earthquakes;
      }),
      catchError((error) => {
        throw new Error(
          `Erreur lors de la récupération des données USGS : ${error.message}`,
        );
      }),
    );
  }
}
