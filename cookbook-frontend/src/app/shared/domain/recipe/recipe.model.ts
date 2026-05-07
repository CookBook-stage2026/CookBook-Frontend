import { Unit } from '@shared/domain/ingredient';

export interface NewRecipeIngredientDto {
  ingredientId: string;
  baseQuantity: number;
}

export interface CreateRecipeDto {
  name: string;
  description: string;
  durationInMinutes: number;
  steps: string[];
  ingredients: NewRecipeIngredientDto[];
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
  ingredientIds: string[];
  shouldApplyPreferences: boolean;
  page: number;
  size: number;
}

export interface UpdateRecipeDto {
  name: string;
  description: string;
  durationInMinutes: number;
  steps: string[];
  ingredients: NewRecipeIngredientDto[];
  servings: number;
}
