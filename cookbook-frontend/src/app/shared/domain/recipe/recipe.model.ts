export interface RecipeIngredientDto {
  ingredientId: string;
  baseQuantity: number;
}

export interface CreateRecipeDto {
  name: string;
  description: string;
  durationInMinutes: number;
  steps: string[];
  ingredients: RecipeIngredientDto[];
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

export interface RecipeSummary {
  id: string;
  name: string;
  description: string;
  durationInMinutes: number;
}
