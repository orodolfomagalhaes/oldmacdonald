import {HttpClient} from "../http-client/http-client.ts";
import {IPaginatedItems} from "../../interfaces/paginated-items.interface.ts";
import {IFarm} from "../../interfaces/farm.interface.ts";
import {IFilterParams} from "../../interfaces/filter-params.interface.ts";
import {IPaginationParams} from "../../interfaces/pagination-params.interface.ts";
import {ICropProduction} from "../../interfaces/crop-production.interface.ts";
import {CropProductionsService} from "../crop-productions/crop-productions.service.ts";

type ResponseStatusMessage = {success: boolean, message: unknown}

export class FarmService extends HttpClient {

  protected baseUrl: string = 'http://localhost:3000/farms';

  private cropProductionsService: CropProductionsService;

  constructor(cropProductionService = new CropProductionsService()) {
    super();
    this.cropProductionsService = cropProductionService;
  }

  async getAllFarms(filters?: IFilterParams, pagination: IPaginationParams = {_per_page: 10, _page: 1}): Promise<IPaginatedItems> {
    /**
     * This function is created to simulate a middleware in json-server,
     * as the current version does not allow adding custom middlewares directly.
     * It filters the `cropProductions` of each farm and removes any crops
     * that have the `deletedAt` property, effectively excluding them from the response.
     *
     * @param response - The response object from json-server request that contains data.
     * @returns The modified response object with the filtered data, where
     *                `cropProductions` without the `deletedAt` field are kept.
     */
    const filterDeletedAt = async (response: IPaginatedItems): Promise<IPaginatedItems> => {
      const filteredData = response.data.map((farm: any) => ({
        ...farm,
        cropProductions: farm.cropProductions.filter((crop: any) => !crop.deletedAt)
      }));
      response.data = filteredData;
      return response;
    };
    return this.get<IPaginatedItems>('?_embed=cropProductions', filters, pagination)
                .then(filterDeletedAt);
  }

  async createFarm(farm: IFarm): Promise<IFarm> {
    return this.post('', farm);
  }

  async updateFarm(farm: Partial<IFarm>): Promise<IFarm> {
    return this.put(`/${farm.id}`, farm);
  }

  async deleteFarm(id: string): Promise<{message: string}> {
    return this.delete(`/${id}`);
  }

  // Custom
  async save(data: IFarm): Promise<ResponseStatusMessage> {
    const { cropProductions, ...farm } = data;
    // Add farmId to new cropProductions
    const cropProductionsUpdated = cropProductions!.map((item: ICropProduction) => {
      item.farmId = farm.id;
      return item;
    });
    // Prepare requests
    const requests: Promise<any>[] = [];
    cropProductionsUpdated!.forEach((item: ICropProduction) => {
      if (item.id) {
        requests.push(this.cropProductionsService.updateCropProduction(item));
        return;
      }
      requests.push(this.cropProductionsService.createCropProduction(item));
    });
    requests.push(this.updateFarm(farm));

    try {
      await Promise.all(requests);
      return { success: true, message: 'Farm updated successfully.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async create(data: IFarm): Promise<ResponseStatusMessage> {
    try {
      const { cropProductions, ...farm } = data;
      // Save farm to get farmId
      const savedFarm = await this.createFarm(farm);
      // Prepare other requests
      const requests: Promise<any>[] = [];
      cropProductions!.forEach((item: ICropProduction) => {
        item.farmId = savedFarm.id;
        requests.push(this.cropProductionsService.createCropProduction(item));
      });
      await Promise.all(requests);
      return { success: true, message: 'Farm created successfully.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async destroy(farmId: string): Promise<ResponseStatusMessage> {
    try {
      await this.deleteFarm(farmId);
      return { success: true, message: 'Farm deleted successfully.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}