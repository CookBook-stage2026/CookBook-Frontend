import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, catchError, throwError, of} from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { environment } from '../../../../environment';
import {Ingredient} from '@shared/domain/ingredient';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = `${environment.apiUrl}/ingredients`;

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

  searchIngredients(query: string, page = 0, size = 10): Observable<Ingredient[]> {
    if (!query.trim()) {
      return of([]);
    }
    return this.http.get<Ingredient[]>(`${this.apiUrl}/search`, {
      params: {
        query: query,
        page: page.toString(),
        size: size.toString()
      }
    });
  }
}
