import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { Ingredient } from '@shared/domain/ingredient';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ingredients`;

  getIngredients(
    query?: string,
    excludedIds: string[] = [],
    page = 0,
    size = 10
  ): Observable<Ingredient[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (query && query.trim() !== '') {
      params = params.set('query', query);
    }

    if (excludedIds.length > 0) {
      excludedIds.forEach(id => {
        params = params.append('excludedIds', id);
      });
    }

    return this.http.get<Ingredient[]>(this.apiUrl, { params });
  }
}
