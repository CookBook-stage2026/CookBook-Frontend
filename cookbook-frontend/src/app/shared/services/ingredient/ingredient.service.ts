import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import {
  CreateIngredientDto,
  Ingredient,
  IngredientSearchRequest,
  UpdateIngredientDto
} from '@shared/domain/ingredient';
import { PaginatedResponse } from '@shared/domain/paginated-response';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ingredients`;

  createIngredient(recipe: CreateIngredientDto): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.apiUrl, recipe);
  }

  searchIngredients(request: IngredientSearchRequest): Observable<PaginatedResponse<Ingredient>> {
    return this.http.post<PaginatedResponse<Ingredient>>(
      `${this.apiUrl}/search`,
      request
    );
  }

  updateIngredient(id: string, dto: UpdateIngredientDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deleteIngredient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getUnits(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/units`);
  }
}
