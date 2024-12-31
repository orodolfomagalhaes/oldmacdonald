import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {CropProductionsService} from "./crop-productions.service.ts";
import {ICropProduction} from "../../interfaces/crop-production.interface.ts";

describe('CropProductionsService', () => {
  let service: CropProductionsService;
  const baseUrl = 'http://localhost:3000/cropProductions';
  let url: URL;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    service = new CropProductionsService();
    url = new URL(baseUrl);
  });

  it('should create a crop production', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({sucess: true}),
    });

    const cropItem: ICropProduction = {
      cropTypeId: "ct001",
      isIrrigated: true,
      isInsured: false,
    }
    const response = await service.createCropProduction(cropItem);
    expect(response).toEqual({sucess: true});
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cropItem)
    });
  });

  it('should update a crop production', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({sucess: true}),
    });

    const cropItem: ICropProduction = {
      id: "cp001",
      cropTypeId: "ct001",
      isIrrigated: true,
      isInsured: false,
    }
    url = new URL(`${baseUrl}/${cropItem.id}`);
    const response = await service.updateCropProduction(cropItem);
    expect(response).toEqual({sucess: true});
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cropItem)
    });
  });


});