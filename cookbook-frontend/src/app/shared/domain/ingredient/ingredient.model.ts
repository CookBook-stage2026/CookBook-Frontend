export function formatCategoryLabel(category: string): string {
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' & ');
}

interface UnitDefinition {
  label: (count: number) => string;
  abbreviation: string;
}

const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
  GRAM: { abbreviation: 'g', label: () => 'Gram' },
  KILOGRAM: { abbreviation: 'kg', label: () => 'Kilogram' },
  MILLILITER: { abbreviation: 'ml', label: () => 'Milliliter' },
  LITER: { abbreviation: 'L', label: () => 'Liter' },
  TEASPOON: { abbreviation: 'tsp', label: (count) => count === 1 ? 'Teaspoon' : 'Teaspoons' },
  TABLESPOON: { abbreviation: 'tbsp', label: (count) => count === 1 ? 'Tablespoon' : 'Tablespoons' },
  CUP: { abbreviation: 'cup', label: (count) => count === 1 ? 'Cup' : 'Cups' },
  PIECE: { abbreviation: 'pc', label: (count) => count === 1 ? 'Piece' : 'Pieces' },
  PINCH: { abbreviation: 'pinch', label: (count) => count === 1 ? 'Pinch' : 'Pinches' },
};

export function formatUnit(unit: string, count = 1): string {
  const definition = UNIT_DEFINITIONS[unit];
  if (definition) return definition.label(count);

  return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
}

export function formatUnitAbbreviation(unit: string): string {
  const definition = UNIT_DEFINITIONS[unit];
  if (definition) return definition.abbreviation;

  return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
}

export interface Ingredient {
  id?: string;
  name: string;
  unit?: string;
  category?: string;
}

export interface IngredientSearchRequest {
  query?: string;
  alreadySelectedIds?: string[];
  page?: number;
  size?: number;
}

export interface CreateIngredientDto {
  name: string;
  unit: string;
  categories: string[];
}
