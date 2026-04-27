export type Unit = 'GRAM' | 'KILOGRAM' | 'MILLILITER' | 'LITER' | 'TEASPOON' | 'TABLESPOON' | 'CUP' | 'PIECE' | 'PINCH' | 'NONE';

export function formatCategoryLabel(category: string): string {
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' & ');
}

export interface Ingredient {
  id?: string;
  name: string;
  unit?: Unit | null;
  category?: string;
}

export interface IngredientSearchRequest {
  query?: string;
  alreadySelectedIds?: string[];
  page?: number;
  size?: number;
}
