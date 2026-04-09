export type Unit = 'Tablespoon' | 'Teaspoon' | 'Kilogram' | 'Gram' | 'Liter' | 'Milliliter' | 'Cup' | 'Piece';

export interface Ingredient {
  id?: string;
  name: string;
  unit?: Unit | null;
}
