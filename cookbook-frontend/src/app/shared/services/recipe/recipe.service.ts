import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  searchRecipes(
    ingredientIds: string[] = [],
    applyPreferences: boolean = true,
    page: number = 0,
    size: number = 20
  ): Observable<PaginatedResponse<RecipeSummary>> {
    const body: RecipeSearchRequest = {
      ingredientIds: ingredientIds?.length > 0 ? ingredientIds : undefined,
      applyPreferences,
      page,
      size,
    };

    return this.http.post<PaginatedResponse<RecipeSummary>>(`${this.apiUrl}/search`, body);
  }

  getRecipeById(id: string): Observable<RecipeDto> {
    return this.http.get<RecipeDto>(`${this.apiUrl}/${id}`)
  }
}
