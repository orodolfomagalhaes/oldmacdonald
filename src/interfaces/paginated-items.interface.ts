import {IFarm} from "./farm.interface.ts";

export type IPaginatedItems = {
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
  items: number
  data: IFarm[]
}