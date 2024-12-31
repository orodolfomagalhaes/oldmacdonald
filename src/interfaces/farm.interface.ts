import {ICropProduction} from "./crop-production.interface.ts";

export interface IFarm {
  id?: string;
  farmName: string;
  landArea: number;
  unitOfMeasure: string;
  address: string;
  cropProductions?: ICropProduction[];
}