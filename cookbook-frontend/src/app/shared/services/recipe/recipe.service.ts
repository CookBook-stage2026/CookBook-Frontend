import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CreateRecipeDto, RecipeDto, RecipeSearchRequest, RecipeSummary, UpdateRecipeDto } from '@shared/domain/recipe';
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

    return this.http.post<PaginatedResponse<RecipeSummary>>(`${this.apiUrl}/filter`, body);
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
}
