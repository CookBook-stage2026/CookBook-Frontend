export type Unit = 'GRAM' | 'KILOGRAM' | 'MILLILITER' | 'LITER' | 'TEASPOON' | 'TABLESPOON' | 'CUP' | 'PIECE' | 'NONE';

export interface Ingredient {
  id?: string;
  name: string;
  unit?: Unit | null;
}
