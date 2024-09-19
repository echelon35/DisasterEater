import { HttpService } from '@nestjs/axios';
import { GdacsService } from '../Application/gdacs.service';
import { lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { hasSameStructure } from '../Utils/HasSameStructure';

describe('Inondation datas from Gdacs', () => {
  let gdacsService: GdacsService;
  let httpService: HttpService;
  let mockResponse, mockResponseWithErrors;

  beforeEach(() => {
    gdacsService = new GdacsService(httpService);
    httpService = new HttpService();
    mockResponse = JSON.parse(
      fs.readFileSync(
        __dirname + '/Mocks/gdacs_inondation_correct.json',
        'utf8',
      ),
    );
    mockResponseWithErrors = JSON.parse(
      fs.readFileSync(
        __dirname + '/Mocks/gdacs_inondation_errors.json',
        'utf8',
      ),
    );
  });

  /**
   * Test GDACS API
   */
  describe('Get Inondations data from GDACS API', () => {
    it('should receive a 200 response with structured objects or 404 response from GDACS', async () => {
      //404 because it is the status returned if there's no disasters
      const apiUrl =
        'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=FL';
      const response = await lastValueFrom(httpService.get(apiUrl));
      //Fail -> L'API est down
      expect(response.status == 200 || response.status == 404).toBeTruthy();

      if (response.status == 200) {
        // expect(response.data).toHaveProperty('features');
        // expect(response.data.features.length).toBeGreaterThan(0);
        expect(hasSameStructure(mockResponse, response.data)).toBeTruthy();
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    });
  });

  /**
   * Test GDACS To Satellearth conversion
   */
  describe('Convert inondations data from GDACS API into inondations models', () => {
    it('should only parse inondation with all mandatories attributes', async () => {
      const gdacsList = gdacsService.convertDataToInondation(
        mockResponseWithErrors.features,
      );

      //The only object created is the one with all its properties
      expect(gdacsList.length).toBe(2);

      //Check sourceId to be sure they're the good test cases
      expect(gdacsList[0].premier_releve).toStrictEqual(
        new Date('2024-05-18T12:00:00Z'),
      );
      expect(gdacsList[1].premier_releve).toStrictEqual(
        new Date('2024-05-18T12:00:00Z'),
      );
    });

    it('should contains attributes with well formats', async () => {
      const gdacsList = gdacsService.convertDataToInondation(
        mockResponseWithErrors.features,
      );

      expect(gdacsList[0].premier_releve).toStrictEqual(
        new Date('2024-05-18T12:00:00Z'),
      );
      expect(gdacsList[0].dernier_releve).toStrictEqual(
        new Date('2024-09-16T01:00:00Z'),
      );
      expect(gdacsList[0].idSource).toBe('99999');
      expect(gdacsList[0].sourceId).toBe('GDACS');
      expect(gdacsList[0].point).toStrictEqual({
        type: 'Point',
        coordinates: [5.6166523, 6.4166789],
      });
    });
  });
});
