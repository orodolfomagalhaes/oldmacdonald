import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {HttpClient} from "./http-client.ts";

const BASE_URL = 'https://api.exemplo.com'

class TestHttpClient extends HttpClient {
  protected baseUrl = BASE_URL;
}

describe('HttpClient', () => {
  let client: TestHttpClient;
  const endpoint = '/endpoint';
  const mockResponse = { data: 'some data' };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    client = new TestHttpClient();
  });

  it('should make a GET request correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
    const url: URL = new URL(BASE_URL + endpoint);
    const response = await client.get(endpoint);
    expect(response).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(url);
  });

  it('should make a GET request correctly with the search filter parameter and pagination', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
    const filter = { name: 'John Doe' }
    const pagination = {_page: 1, _per_page: 10};
    const response = await client.get(endpoint, filter, pagination);

    const urlWithQueryParams = new URL(BASE_URL + endpoint);
    urlWithQueryParams.searchParams.append('name', 'John Doe');
    urlWithQueryParams.searchParams.append("_page", String(pagination._page));
    urlWithQueryParams.searchParams.append("_per_page", String(pagination._per_page));

    expect(response).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(urlWithQueryParams);
  });

  it('should throw an error if the GET request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: vi.fn(),
    });

    await expect(client.get(endpoint)).rejects.toThrow('404 - GET request failed.');
  });

  it('should make a GET request by id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
    const url: URL = new URL(`${BASE_URL}/${endpoint}`);
    const response = await client.getById(endpoint);

    expect(response).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(url);
  });

  it('should throw an error if the GET request by id fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: vi.fn(),
    });
    await expect(client.getById(endpoint)).rejects.toThrow('404 - GET request failed.');
  });

  it('should make a POST request correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
    const url = new URL(BASE_URL + endpoint);
    const payload = { name: 'João' };
    const response = await client.post(endpoint, payload);

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(response).toEqual(mockResponse);
  });

  it('should throw an error if the POST request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: vi.fn(),
    });
    const payload = { name: 'João' };

    await expect(client.post(endpoint, payload)).rejects.toThrow('400 - POST request failed.');
  });

  it('should make a PUT request correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
    const url = new URL(BASE_URL + endpoint);
    const payload = { name: 'João Atualizado' };
    const response = await client.put(endpoint, payload);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(response).toEqual(mockResponse);
  });

  it('should throw an error if the PUT request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn(),
    });
    const payload = { name: 'João Atualizado' };
    await expect(client.put(endpoint, payload)).rejects.toThrow('500 - PUT request failed.');
  });

  it('should make a PATCH request correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
    const url = new URL(BASE_URL + endpoint);
    const payload = { name: 'João Alterado' };
    const response = await client.patch(endpoint, payload);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(response).toEqual(mockResponse);
  });

  it('should throw an error if the PATCH request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: vi.fn(),
    });
    const payload = { name: 'João Alterado' };
    await expect(client.patch(endpoint, payload)).rejects.toThrow('403 - PATCH request failed.');
  });

  it('should make a DELETE request correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });
    const url = new URL(BASE_URL + endpoint);
    const response = await client.delete(endpoint);
    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'DELETE',
    });
    expect(response).toEqual(mockResponse);
  });

  it('should throw an error if the DELETE request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn(),
    });

    await expect(client.delete(endpoint)).rejects.toThrow('500 - DELETE request failed.');
  });
});
