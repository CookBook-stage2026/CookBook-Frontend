export type Unit = 'GRAM' | 'KILOGRAM' | 'MILLILITER' | 'LITER' | 'TEASPOON' | 'TABLESPOON' | 'CUP' | 'PIECE' | 'PINCH' | 'NONE';

export interface Ingredient {
  id?: string;
  name: string;
  unit?: Unit | null;
}

export interface IngredientSearchRequest {
  query?: string;
  alreadySelectedIds?: string[];
  page?: number;
  size?: number;
}
