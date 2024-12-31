export interface ICropProduction {
  id?: string;
  cropTypeId: string;
  isIrrigated: boolean;
  isInsured: boolean;
  farmId?: string;
  deletedAt?: string;
}