import { HttpService } from '@nestjs/axios';
import { GdacsService } from '../Application/gdacs.service';
import * as fs from 'fs';
import { hasSameStructure } from '../Utils/HasSameStructure';
import { SourceService } from '../Application/source.service';

describe('Inondation datas from Gdacs', () => {
  let gdacsService: GdacsService;
  let httpService: HttpService;
  let sourceService: SourceService;
  let mockResponse, mockResponseWithErrors;

  beforeEach(() => {
    jest.clearAllMocks();
    gdacsService = new GdacsService(httpService, sourceService);
    httpService = new HttpService();
    mockResponse = JSON.parse(
      fs.readFileSync(
        __dirname + '/Mocks/Gdacs/gdacs_inondation_correct.json',
        'utf8',
      ),
    );
    mockResponseWithErrors = JSON.parse(
      fs.readFileSync(
        __dirname + '/Mocks/Gdacs/gdacs_inondation_errors.json',
        'utf8',
      ),
    );
  });

  /**
   * Test GDACS API
   */
  describe('Get Inondations data from GDACS API', () => {
    it('should receive a 200 response with structured objects or 404 response from GDACS', async () => {
      const apiUrl =
        'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=FL';
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
  describe('Convert inondations data from GDACS API into inondations models', () => {
    it('should only parse inondation with all mandatories attributes', async () => {
      const gdacsList = gdacsService.convertDataToInondation(
        mockResponseWithErrors.features,
      );

      //The only object created is the one with all its properties
      expect(gdacsList.length).toBe(1);

      //Check sourceId to be sure they're the good test cases
      expect(gdacsList[0].premier_releve).toStrictEqual(
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
      expect(gdacsList[0].idFromSource).toBe('99999');
      // expect(gdacsList[0].sourceId).toBe('GDACS');
      expect(gdacsList[0].point).toStrictEqual({
        type: 'Point',
        coordinates: [5.6166523, 6.4166789],
      });
    });
  });
});
