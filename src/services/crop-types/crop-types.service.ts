import {HttpClient} from "../http-client/http-client.ts";
import {ICropType} from "../../interfaces/crop-type.interface.ts";

export class CropTypesService extends HttpClient {
  protected baseUrl: string = 'http://localhost:3000/cropTypes';

  constructor() {
    super();
  }

  async getAll(): Promise<ICropType[]> {
    return this.get('');
  }

}