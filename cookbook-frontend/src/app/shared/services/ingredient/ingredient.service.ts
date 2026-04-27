import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { Ingredient, IngredientSearchRequest } from '@shared/domain/ingredient';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ingredients`;

  searchIngredients(
    query?: string,
    alreadySelectedIds: string[] = [],
    page = 0,
    size = 10
  ): Observable<Ingredient[]> {
    const body: IngredientSearchRequest = {
      query: query?.trim() || undefined,
      alreadySelectedIds: alreadySelectedIds.length > 0 ? alreadySelectedIds : undefined,
      page,
      size,
    };

    return this.http.post<Ingredient[]>(`${this.apiUrl}/search`, body);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }
}
