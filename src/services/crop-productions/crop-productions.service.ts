import {HttpClient} from "../http-client/http-client.ts";
import {ICropProduction} from "../../interfaces/crop-production.interface.ts";

export class CropProductionsService extends HttpClient {

  protected baseUrl: string = 'http://localhost:3000/cropProductions';

  createCropProduction(cropItem: ICropProduction): Promise<ICropProduction> {
    return this.post('', cropItem);
  }

  updateCropProduction(cropItem: ICropProduction): Promise<ICropProduction> {
    return this.put(`/${cropItem.id}`, cropItem);
  }

}