import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CreateRecipeDto, RecipeDto, RecipeSearchRequest, RecipeSummary } from '@shared/domain/recipe';
import { ToastService } from '@core/services';
import { environment } from '../../../../environment';
import { PaginatedResponse } from '@shared/domain/paginated-response';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = `${environment.apiUrl}/recipes`;

  createRecipe(recipe: CreateRecipeDto): Observable<RecipeDto> {
    return this.http.post<RecipeDto>(this.apiUrl, recipe).pipe(
      tap(() => this.toastService.show("Recipe successfully created!", "success")),
      catchError(err => {
        this.toastService.show('Failed to create a recipe.', 'error');
        return throwError(() => err);
      })
    );
  }

  searchRecipesByFilter(
    ingredientIds: string[] = [],
    shouldApplyPreferences: boolean = true,
    page: number = 0,
    size: number = 20
  ): Observable<PaginatedResponse<RecipeSummary>> {
    const body: RecipeSearchRequest = {
      ingredientIds,
      shouldApplyPreferences: shouldApplyPreferences,
      page,
      size,
    };

    return this.http.post<PaginatedResponse<RecipeSummary>>(`${this.apiUrl}/search`, body);
  }

  getRecipeById(id: string): Observable<RecipeDto> {
    return this.http.get<RecipeDto>(`${this.apiUrl}/${id}`)
  }

  searchRecipesByName(
    query: string | null,
    page = 0,
    size = 10
  ): Observable<RecipeSummary[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (query?.trim()) {
      params = params.set('query', query.trim());
    }

    return this.http.get<RecipeSummary[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(err => {
        console.error('Search failed:', err);
        return throwError(() => err);
      })
    );
  }
}
