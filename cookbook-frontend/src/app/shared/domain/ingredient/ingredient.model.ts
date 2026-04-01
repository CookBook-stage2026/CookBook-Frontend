export type Unit = 'Eetlepel' | 'Theelepel' | 'Kilogram' | 'Gram' | 'Liters' | 'Milligram' | 'Milliliters' | 'Kopje' | 'Snufje' | 'Stuk' | 'Teen';

export interface Ingredient {
  id?: string;
  name: string;
  description: string;
  unit?: Unit | null;
}
