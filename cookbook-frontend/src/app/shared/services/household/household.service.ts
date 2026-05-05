import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CreateHouseholdRequest, Household } from '@shared/domain/household';
import { ToastService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class HouseholdService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/households';
  private readonly toastService = inject(ToastService);

  createHousehold(request: CreateHouseholdRequest): Observable<Household> {
    return this.http.post<Household>(this.apiUrl, request)
      .pipe(
        tap(() => this.toastService.show("Household successfully created!", "success")),
        catchError(err => {
          this.toastService.show('Failed to create a household.', 'error');
          return throwError(() => err);
        })
      );
  }
}
