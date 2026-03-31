import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environment';
import { Ingredient } from '../models/ingredient.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/ingredients`;

  getIngredients(page: number, size: number): Observable<Ingredient[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Ingredient[]>(this.apiUrl, { params }).pipe(
      catchError(err => {
        this.toastService.show('Failed to load ingredients.', 'error');
        return throwError(() => err);
      })
    );
  }

  addIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.apiUrl, ingredient).pipe(
      tap(() => this.toastService.show('Ingredient added successfully!', 'success')),
      catchError(err => {
        this.toastService.show('Failed to add ingredient.', 'error');
        return throwError(() => err);
      })
    );
  }
}
