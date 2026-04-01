import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';
import { CreateRecipeDto, RecipeDto } from '@shared/domain/recipe';
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
      tap(() => this.toastService.show("Recipe succesfully created!", "success")),
      catchError(err => {
        this.toastService.show('Failed to create a recipe.', 'error');
        return throwError(() => err);
      })
    );
  }
}
