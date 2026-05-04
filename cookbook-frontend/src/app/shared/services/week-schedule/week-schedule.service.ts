import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, of, tap, throwError } from 'rxjs';
import { ToastService } from '@core/services';
import { environment } from '../../../../environment';
import { CreateWeekScheduleRequest, WeekScheduleResponse } from '@shared/domain/week-schedule';

@Injectable({ providedIn: 'root' })
export class WeekScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/schedules`;
  private readonly toastService = inject(ToastService);

  createSchedule(request: CreateWeekScheduleRequest) {
    return this.http.post<WeekScheduleResponse>(`${this.apiUrl}`, request).pipe(
      tap(() => this.toastService.show('Schedule created successfully.', 'success')),
      catchError(err => {
        const message = err.error?.detail ?? 'Failed to create a schedule.';
        this.toastService.show(message, 'error');
        return throwError(() => err);
      })
    );
  }

  getSchedule() {
    return this.http.get<WeekScheduleResponse>(`${this.apiUrl}`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(undefined);
        }
        this.toastService.show('Failed to load your schedule.', 'error');
        return throwError(() => err);
      })
    );
  }
}
