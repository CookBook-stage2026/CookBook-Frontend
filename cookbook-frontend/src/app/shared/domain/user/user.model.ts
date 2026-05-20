import { Ingredient } from '@shared/domain/ingredient';

export interface UpdateUserPreferencesRequest {
  excludedCategories: string[];
  excludedIngredientIds: string[];
}

export interface UserPreferencesDto {
  excludedCategories: string[];
  excludedIngredients: Ingredient[];
}

export interface User {
  userId: string;
  email: string;
  displayName: string;
}
