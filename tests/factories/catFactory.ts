import { NewCat } from '../types/NewCat';
import { Sex } from '../types/enums/Sex';
import catFixtures from '../fixtures/cats.json';

export class CatFactory {
  private static getBaseCat(): NewCat {
    return {
      name: `TestCat_${Date.now()}`,
      sex: Sex.Female,
      age: 3,
      breed: "Test Breed",
      colour: "White",
      likes: ["testing", "debugging"]
    };
  }

  private static convertToNewCat(data: any): NewCat {
    return {
      ...data,
      sex: data.sex === 'Male' ? Sex.Male : Sex.Female
    };
  }

  static getValidCat(name?: string): NewCat {
    const baseCat = this.getBaseCat();
    return name ? { ...baseCat, name } : baseCat;
  }

  static getInvalidCatWithNegativeAge(): Partial<NewCat> {
    const invalidCat = catFixtures.invalidCats.negativeAge;
    return {
      ...invalidCat,
      sex: invalidCat.sex === 'Male' ? Sex.Male : Sex.Female
    };
  }

  static getMissingFieldsCat(): Partial<NewCat> {
    return catFixtures.invalidCats.missingFields;
  }

  static getRandomValidCat(): NewCat {
    const validCats = catFixtures.validCats;
    const randomCat = validCats[Math.floor(Math.random() * validCats.length)];
    return this.convertToNewCat({
      ...randomCat,
      name: `${randomCat.name}_${Date.now()}`
    });
  }

  static getPairOfCats(): [NewCat, NewCat] {
    return [
      this.getValidCat('Cat1_' + Date.now()),
      this.getValidCat('Cat2_' + Date.now())
    ];
  }
}
