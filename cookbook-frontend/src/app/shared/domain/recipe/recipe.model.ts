import { Unit } from '@shared/domain/ingredient';

export interface CreateRecipeIngredientDto {
  ingredientId: string;
  baseQuantity: number;
}

export interface CreateRecipeDto {
  name: string;
  description: string;
  durationInMinutes: number;
  steps: string[];
  ingredients: CreateRecipeIngredientDto[];
  servings: number;
}

export interface RecipeDto {
  id: string;
  name: string;
  description: string;
  durationInMinutes: number;
  steps: string[];
  ingredients: RecipeIngredientDto[];
  servings: number;
}

export interface RecipeIngredientDto {
  ingredientId: string;
  name: string;
  baseQuantity: number;
  unit?: Unit | null;
}

export interface RecipeSummary {
  id: string;
  name: string;
  description: string;
  durationInMinutes: number;
}

export interface RecipeSearchRequest {
  ingredientIds?: string[];
  applyPreferences?: boolean;
  page?: number;
  size?: number;
}
