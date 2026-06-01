export interface NewRecipeIngredientDto {
  ingredientId: string;
  baseQuantity: number;
  unit: string;
}

export interface MacroDto {
  type: string;
  value: number;
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
  isOwner: boolean;
  totalMacros: MacroDto[];
}

export interface RecipeIngredientDto {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  description: string;
  durationInMinutes: number;
  creator: string;
  isOwner: boolean;
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
