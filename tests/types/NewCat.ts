import { Sex } from './enums/Sex';

export interface NewCat {
  name: string;
  sex: Sex;
  age: number;
  breed: string;
  colour: string;
  likes: string[];
}
