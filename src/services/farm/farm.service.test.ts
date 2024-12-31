import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {FarmService} from "./farm.service.ts";

describe('FarmService', () => {
  let farmService: FarmService;
  const baseUrl = 'http://localhost:3000';
  let endpoint = '';
  let url: URL;
  const mockedResponse = {
    "first": 1,
    "prev": null,
    "next": 2,
    "last": 5,
    "pages": 5,
    "items": 49,
    "data": [
      {
        id: '1',
        farmName: 'Fazenda Esperança',
        landArea: 200,
        unitOfMeasure: 'hectare',
        address: 'Rua do Campo, 123, Interior - SP',
        cropProductions: [
          {
            id: "cp001",
            cropTypeId: "ct001",
            isIrrigated: true,
            isInsured: false,
            farmId: "1"
          },
          {
            id: "cp002",
            cropTypeId: "ct002",
            isIrrigated: true,
            isInsured: false,
            farmId: "1"
          },
        ]
      },
      {
        id: '2',
        farmName: 'Fazenda Bom successo',
        landArea: 300,
        unitOfMeasure: 'acre',
        address: 'Rua da Cidade, 456, Cidade - SP',
        cropProductions: [
          {
            id: "cp001",
            cropTypeId: "ct001",
            isIrrigated: true,
            isInsured: false,
            farmId: "2"
          },
          {
            id: "cp002",
            cropTypeId: "ct002",
            isIrrigated: true,
            isInsured: false,
            farmId: "2"
          },
        ]
      }
    ]
  };
  const mockedFarmData: any = {
    farmName: 'Fazenda Esperança',
    landArea: 200,
    unitOfMeasure: 'hectare',
    address: 'Rua do Campo, 123, Interior - SP',
    cropProductions: [
      {
        cropTypeId: "ct001",
        isIrrigated: true,
        isInsured: false
      }
    ]
  };
  const mockedFarmDataUpdate: any = {
    id: '789',
    farmName: 'Fazenda Esperança',
    landArea: 200,
    unitOfMeasure: 'hectare',
    address: 'Rua do Campo, 123, Interior - SP',
    cropProductions: [
      {
        id: 'cp001',
        cropTypeId: "ct001",
        isIrrigated: true,
        isInsured: false,
      },
      {
        cropTypeId: "ct002",
        isIrrigated: true,
        isInsured: false,
      }
    ]
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    farmService = new FarmService();
    endpoint = '/farms';
    url = new URL(baseUrl + endpoint);
  });

  it('should get all farms', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockedResponse),
    });
    const response = await farmService.getAllFarms();
    url.searchParams.append('_embed', 'cropProductions');
    url.searchParams.append('_page', '1');
    url.searchParams.append('_per_page', '10');
    expect(fetch).toHaveBeenCalledWith(url);
    expect(response).toEqual(mockedResponse);
  });

  it('should create a new farm', async () => {
    const data: any = {
      farmName: 'Fazenda Esperança',
      landArea: 200,
      unitOfMeasure: 'hectare',
      address: 'Rua do Campo, 123, Interior - SP',
      cropProductions: [
        {
          cropTypeId: "ct001",
          isIrrigated: true,
          isInsured: false
        }
      ]
    };
    // @ts-ignore
    const {cropProductions, ...farm } = data

    const createFarmMock = vi.fn().mockResolvedValue({id: '998', ...farm});
    const cropProductionsServiceMock = {
      createCropProduction: vi.fn().mockResolvedValue({ farmId: '998', cropProductions }),
    };

    const context = {
      createFarm: createFarmMock,
      cropProductionsService: cropProductionsServiceMock,
    };
    const response = await farmService.create.call(context, data);

    expect(createFarmMock).toHaveBeenCalledTimes(1);
    expect(createFarmMock).toHaveBeenCalledWith(farm);
    expect(cropProductionsServiceMock.createCropProduction).toHaveBeenCalledTimes(1);
    expect(cropProductionsServiceMock.createCropProduction).toHaveBeenCalledWith(cropProductions[0]);
    expect(response).toEqual({ success: true, message: 'Farm created successfully.' });
  });

  it('should return error message when create farm fails', async () => {
    const errorObject = { success: false, message: 'Failed to create farm' }
    globalThis.fetch = vi.fn().mockRejectedValue(errorObject);
    const response = await farmService.create(mockedFarmData);
    expect(response).toEqual(errorObject);
  });

  it('should update a farm', async () => {
    // @ts-ignore
    const {cropProductions, ...farm } = mockedFarmDataUpdate;
    const updateFarmMock = vi.fn().mockResolvedValue(farm);
    const cropProductionsServiceMock = {
      createCropProduction: vi.fn().mockResolvedValue({ farmId: farm.id, cropProductions }),
      updateCropProduction: vi.fn().mockResolvedValue({ farmId: farm.id, cropProductions }),
    };
    const context = {
      updateFarm: updateFarmMock,
      cropProductionsService: cropProductionsServiceMock,
    };
    const response = await farmService.save.call(context, mockedFarmDataUpdate);

    expect(updateFarmMock).toHaveBeenCalledTimes(1);
    expect(updateFarmMock).toHaveBeenCalledWith(farm);
    expect(cropProductionsServiceMock.updateCropProduction).toHaveBeenCalledTimes(1);
    expect(cropProductionsServiceMock.updateCropProduction).toHaveBeenCalledWith(cropProductions[0]);
    expect(cropProductionsServiceMock.createCropProduction).toHaveBeenCalledTimes(1);
    expect(cropProductionsServiceMock.createCropProduction).toHaveBeenCalledWith(cropProductions[1]);
    expect(response).toEqual({ success: true, message: 'Farm updated successfully.' });
  });

  it('should make a post request to update a farm', async () => {
    const {cropProductions, ...farm } = mockedFarmDataUpdate;
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(farm),
    });
    url = new URL(`${baseUrl + endpoint}/${farm.id}`);
    const response = await farmService.updateFarm(farm);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PUT',
      body: JSON.stringify(farm),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response).toEqual(farm);
  });

  it('should return error message when update farm fails', async () => {
    const errorObject = { success: false, message: 'Error updating farm' }
    const {cropProductions, ...farm } = mockedFarmDataUpdate

    const updateFarmMock = vi.fn().mockRejectedValue(errorObject);
    const cropProductionsServiceMock = {
      createCropProduction: vi.fn().mockResolvedValue({ farmId: farm.id, cropProductions }),
      updateCropProduction: vi.fn().mockResolvedValue({ farmId: farm.id, cropProductions }),
    };
    const context = {
      updateFarm: updateFarmMock,
      cropProductionsService: cropProductionsServiceMock,
    };
    const response = await farmService.save.call(context, mockedFarmDataUpdate);
    expect(response).toEqual(errorObject);
  });

  it('should delete a farm', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ message: 'deleted' }),
    });
    const id = '1';
    url = new URL(`${baseUrl + endpoint}/${id}`);
    const response = await farmService.destroy(id);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'DELETE',
    });
    expect(response).toEqual({ success: true, message: 'Farm deleted successfully.' });
  });

  it('should return error message when delete farm fails', async () => {
    const farmId = '123';
    const errorObject = { success: false, message: 'Failed to delete farm' }
    globalThis.fetch = vi.fn().mockRejectedValue(errorObject);
    const response = await farmService.destroy(farmId);
    expect(response).toEqual(errorObject);
  });

});
