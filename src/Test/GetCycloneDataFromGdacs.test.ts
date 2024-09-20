import { HttpService } from '@nestjs/axios';
import { GdacsService } from '../Application/gdacs.service';
import * as fs from 'fs';
import { hasSameStructure } from '../Utils/HasSameStructure';

describe('Cyclones datas from Gdacs', () => {
  let gdacsService: GdacsService;
  let httpService: HttpService;
  let mockResponse, mockResponseWithErrors;

  beforeEach(() => {
    jest.clearAllMocks();
    gdacsService = new GdacsService(httpService);
    httpService = new HttpService();
    mockResponse = JSON.parse(
      fs.readFileSync(
        __dirname + '/Mocks/Gdacs/gdacs_cyclone_correct.json',
        'utf8',
      ),
    );
    mockResponseWithErrors = JSON.parse(
      fs.readFileSync(
        __dirname + '/Mocks/Gdacs/gdacs_cyclone_errors.json',
        'utf8',
      ),
    );
  });

  /**
   * Test GDACS API
   */
  describe('Get Cyclones data from GDACS API', () => {
    it('should receive a 200 response with structured objects or 404 response from GDACS', async () => {
      const apiUrl =
        'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=TC';
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
  });

  /**
   * Test GDACS To Satellearth conversion
   */
  describe('Convert cyclones data from GDACS API into cyclones models', () => {
    it('should only parse cyclones with all mandatories attributes', async () => {
      const gdacsList = gdacsService.convertDataToCyclone(
        mockResponseWithErrors.features,
      );

      //The only objects created are the ones with all its properties
      expect(gdacsList.length).toBe(1);

      expect(gdacsList[0].premier_releve).toStrictEqual(
        new Date('2024-05-18T15:00:00Z'),
      );
    });

    it('should contains attributes with well formats', async () => {
      const gdacsList = gdacsService.convertDataToCyclone(
        mockResponseWithErrors.features,
      );

      expect(gdacsList[0].premier_releve).toStrictEqual(
        new Date('2024-05-18T15:00:00Z'),
      );
      expect(gdacsList[0].dernier_releve).toStrictEqual(
        new Date('2024-09-17T15:00:00Z'),
      );
      expect(gdacsList[0].idSource).toBe('99999');
      expect(gdacsList[0].sourceId).toBe('GDACS');
      expect(gdacsList[0].point).toStrictEqual({
        type: 'Point',
        coordinates: [-49.1, 19.5],
      });
    });
  });
});
