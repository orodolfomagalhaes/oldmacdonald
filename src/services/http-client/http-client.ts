import {IPaginationParams} from "../../interfaces/pagination-params.interface.ts";
import {IFilterParams} from "../../interfaces/filter-params.interface.ts";

export abstract class HttpClient {

  protected abstract baseUrl: string;

  async get<T>(endpoint: string, filters?: IFilterParams, pagination?: IPaginationParams): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);
    if(filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    if(pagination) {
      if (pagination._page !== undefined) {
        url.searchParams.append("_page", String(pagination._page));
      }
      if (pagination._per_page !== undefined) {
        url.searchParams.append("_per_page", String(pagination._per_page));
      }
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} - GET request failed.`);
    }
    return response.json();
  }

  async getById<T>(endpoint: string): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} - GET request failed.`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`${response.status} - POST request failed.`);
    }
    return response.json();
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`${response.status} - PUT request failed.`);
    }
    return response.json();
  }

  async patch<T>(endpoint: string, body: any): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`${response.status} - PATCH request failed.`);
    }
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);
    const response = await fetch(url, {method: 'DELETE'});
    if (!response.ok) {
      throw new Error(`${response.status} - DELETE request failed.`);
    }
    return response.json();
  }
}
