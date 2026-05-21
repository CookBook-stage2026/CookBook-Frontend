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
  isPublic: boolean;
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
  isPublic: boolean;
  isCreator: boolean;
}

export interface RecipeIngredientDto {
  ingredientId: string;
  name: string;
  baseQuantity: number;
  unit: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  description: string;
  durationInMinutes: number;
  creator: string;
}

export interface RecipeSearchRequest {
  ingredientIds: string[];
  shouldApplyPreferences: boolean;
  includeAccessibleRecipes: boolean;
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
  isPublic: boolean;
}
