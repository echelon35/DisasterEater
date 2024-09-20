import { HttpService } from '@nestjs/axios';
// import { UsgsService } from '../Application/usgs.service';
import * as fs from 'fs';
import { hasSameStructure } from '../Utils/HasSameStructure';

describe('Seisme datas from USGS', () => {
  //   let usgsService: UsgsService;
  let httpService: HttpService;
  let mockResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    // usgsService = new UsgsService(httpService);
    httpService = new HttpService();
    mockResponse = JSON.parse(
      fs.readFileSync(
        __dirname + '/Mocks/Usgs/usgs_seisme_correct.json',
        'utf8',
      ),
    );
  });

  describe('Get seisme data from USGS API', () => {
    it('should receive a 200 response with structured objects or 404 response from GDACS', async () => {
      const apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson`;
      httpService.get(apiUrl).subscribe({
        next: (response) => {
          expect(response.status == 200).toBeTruthy();
          expect(hasSameStructure(mockResponse, response.data)).toBeTruthy();
        },
        error: (error) => {
          expect(error.status == 404).toBeTruthy();
        },
      });
    });
    it('Convert seismes data from USGS API into seismes models', async () => {});
  });
});
