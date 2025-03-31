import { NewCat } from './NewCat';

export interface Cat extends NewCat {
  id: string;
  createdAt: string;
  updatedAt: string;
}
