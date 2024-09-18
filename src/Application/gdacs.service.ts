import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, catchError, map } from 'rxjs';
import { Seisme } from 'src/Domain/Model/seisme.model';
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

  getEarthquakeData(): Observable<AxiosResponse<any>> {
    const apiUrl =
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=EQ';
    return this.httpService.get(apiUrl).pipe(
      map((response: AxiosResponse) => {
        const data = response.data;
        // Extraire les séismes (cela dépend de la structure de tes données JSON)
        // Par exemple, si les séismes sont dans une propriété 'earthquakes' :
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
}
