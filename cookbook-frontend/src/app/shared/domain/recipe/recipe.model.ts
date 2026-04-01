export interface IngredientDto {
  name: string;
  quantity: number;
  unit: string;
}

export interface CreateRecipeDto {
  name: string;
  description: string;
  durationInMinutes: number;
  steps: string[];
  ingredients: { [key: string]: IngredientDto };
}

export interface RecipeDto extends CreateRecipeDto {
  id: string;
}
