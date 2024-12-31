import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {CropTypesService} from "./crop-types.service.ts";

describe('CropTypesService', () => {
  let service: CropTypesService;
  const baseUrl = 'http://localhost:3000/cropTypes';
  const url = new URL(baseUrl);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    service = new CropTypesService();
  });

  it('should get all crop types', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({sucess: true}),
    });

    const response = await service.getAll();
    expect(response).toEqual({sucess: true});
    expect(fetch).toHaveBeenCalledWith(url);
  });

});