export const MACRO_DEFINITIONS: Record<string, { label: string; unit: string; }> = {
  'CALORIES': { label: 'Calories', unit: 'kcal' },
  'FAT': { label: 'Fat', unit: 'g' },
  'PROTEIN': { label: 'Protein', unit: 'g' },
  'CARBS': { label: 'Carbohydrates', unit: 'g' },
  'SUGARS': { label: 'Sugars', unit: 'g' }
};

export function formatMacroType(type: string): string {
  const definition = MACRO_DEFINITIONS[type];
  if (definition) return definition.label;

  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatMacroValue(value: number, type: string): string {
  const definition = MACRO_DEFINITIONS[type];
  const unit = definition?.unit || '';

  const formattedValue = Number.isInteger(value)
    ? value.toFixed(0)
    : value.toFixed(1);

  return `${formattedValue} ${unit}`;
}
