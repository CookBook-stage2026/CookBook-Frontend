export type Unit = 'GRAM' | 'KILOGRAM' | 'MILLILITER' | 'LITER' | 'TEASPOON' | 'TABLESPOON' | 'CUP' | 'PIECE' | 'PINCH' | 'NONE';

export const Categories = {
  VEGETABLE: 'Vegetable',
  FRUIT: 'Fruit',
  MEAT: 'Meat',
  POULTRY: 'Poultry',
  FISH: 'Fish',
  SHELLFISH: 'Shellfish',
  EGG: 'Egg',
  DAIRY: 'Dairy',
  GRAIN: 'Grain',
  LEGUME: 'Legume',
  NUT: 'Nut',
  SEED: 'Seed',
  HERB: 'Herb',
  SPICE: 'Spice',
  OIL_FAT: 'Oil & Fat',
  SWEETENER: 'Sweetener',
  FUNGI: 'Fungi',
  SEAWEED: 'Seaweed',
  SAUCE_CONDIMENT: 'Sauce & Condiment',
  BEVERAGE: 'Beverage',
  ADDITIVE: 'Additive'
} as const;

export type Category = keyof typeof Categories;

export interface Ingredient {
  id?: string;
  name: string;
  unit?: Unit | null;
  category?: Category;
}

export interface IngredientSearchRequest {
  query?: string;
  alreadySelectedIds?: string[];
  page?: number;
  size?: number;
}
