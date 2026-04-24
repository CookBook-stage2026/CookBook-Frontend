import { Category, Ingredient } from '@shared/domain/ingredient';

export interface UpdateUserPreferencesRequest {
  excludedCategories: Category[];
  excludedIngredientIds: string[];
}

export interface UserPreferencesDto {
  excludedCategories: Category[];
  excludedIngredients: Ingredient[];
}
