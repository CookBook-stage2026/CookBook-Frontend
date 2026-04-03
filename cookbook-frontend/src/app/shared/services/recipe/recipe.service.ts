import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {CreateRecipeDto, RecipeDto, RecipeSummary} from '@shared/domain/recipe';
import {ToastService} from '@core/services';
import {environment} from '../../../../environment';

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

  getRecipes(page: number, size: number): Observable<RecipeSummary[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<RecipeSummary[]>(this.apiUrl, { params }).pipe(
      catchError(err => {
        this.toastService.show('Failed to load recipes.', 'error');
        return throwError(() => err);
      })
    );
  }
}
