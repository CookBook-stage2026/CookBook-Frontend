export interface RecipeIngredientDto {
  ingredientId: string;
  isScalable: boolean;
  baseQuantity: number;
}

export interface CreateRecipeDto {
  name: string;
  description: string;
  durationInMinutes: number;
  steps: string[];
  ingredients: RecipeIngredientDto[];
}

export interface RecipeDto extends CreateRecipeDto {
  id: string;
}
