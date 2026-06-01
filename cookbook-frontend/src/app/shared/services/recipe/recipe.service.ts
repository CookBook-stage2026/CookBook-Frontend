import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CreateRecipeDto, RecipeDto, RecipeSummary, UpdateRecipeDto } from '@shared/domain/recipe';
import { ToastService } from '@core/services';
import { environment } from '../../../../environment';
import { PaginatedResponse } from '@shared/domain/paginated-response';
import { ScheduleContext } from '@shared/domain/week-schedule';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = `${environment.apiUrl}/recipes`;

  createRecipe(recipe: CreateRecipeDto): Observable<RecipeDto> {
    return this.http.post<RecipeDto>(this.apiUrl, recipe);
  }

  searchRecipesByFilter(
    ingredientIds: string[],
    shouldApplyPreferences: boolean,
    includeAccessibleRecipes: boolean,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ): Observable<PaginatedResponse<RecipeSummary>> {
    return this.http.post<PaginatedResponse<RecipeSummary>>(`${this.apiUrl}/filter`, {
      page,
      size,
      ingredientIds,
      shouldApplyPreferences,
      includeAccessibleRecipes,
      sortBy,
      sortDirection
    });
  }

  getRecipeById(id: string): Observable<RecipeDto> {
    return this.http.get<RecipeDto>(`${this.apiUrl}/${id}`);
  }

  searchRecipesByName(
    context: ScheduleContext,
    query: string | null,
    page = 0,
    size = 10
  ): Observable<RecipeSummary[]> {
    const endpoint = context.type === 'personal'
      ? `${this.apiUrl}/search/personal`
      : `${this.apiUrl}/search/households/${context.householdId}`;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (query?.trim()) {
      params = params.set('query', query.trim());
    }

    return this.http.get<RecipeSummary[]>(endpoint, { params }).pipe(
      catchError(err => {
        console.error('Search failed:', err);
        return throwError(() => err);
      })
    );
  }

  enhanceRecipe(id: string): Observable<RecipeDto> {
    return this.http.get<RecipeDto>(`${this.apiUrl}/${id}/enhance`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred.';

        if (error.status === 502) {
          errorMessage = 'AI failed to respond, please try again.';
        } else if (error.status === 503) {
          errorMessage = 'AI is currently unavailable, please try again later.';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateRecipe(id: string, dto: UpdateRecipeDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  changeVisibility(id: string, isPublic: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/visibility`, { isPublic });
  }

  importRecipe(url: string): Observable<RecipeDto> {
    return this.http.post<RecipeDto>(`${this.apiUrl}/import`, { url }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to import recipe.';
        if (error.status === 400) errorMessage = 'Invalid URL or unable to extract recipe from that page.';
        else if (error.status === 422) errorMessage = 'Could not find a recipe at the provided URL.';
        else if (error.status === 502 || error.status === 503) errorMessage = 'AI processing failed. Please try again later.';

        this.toastService.show(errorMessage, 'error');
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMacroTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/macro-types`);
  }

  getSortingOptions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/sorting-options`);
  }

  getRecipeForServings(id: string, servings: number): Observable<RecipeDto> {
    return this.http.get<RecipeDto>(`${this.apiUrl}/${id}/servings/${servings}`);
  }

  calculateMacros(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/macros`, null);
  }
}
