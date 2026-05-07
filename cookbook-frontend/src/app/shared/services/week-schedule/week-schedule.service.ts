import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, of, tap, throwError } from 'rxjs';
import { ToastService } from '@core/services';
import { environment } from '../../../../environment';
import { CreateWeekScheduleRequest, UpdateWeekScheduleRequest, WeekScheduleResponse } from '@shared/domain/week-schedule';

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

  updateSchedule(id: string, request: UpdateWeekScheduleRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.toastService.show('Schedule updated successfully.', 'success')),
      catchError(err => {
        const message = err.error?.detail ?? 'Failed to update the schedule.';
        this.toastService.show(message, 'error');
        return throwError(() => err);
      })
    );
  }

  getSchedules(from?: string, to?: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<WeekScheduleResponse[]>(`${this.apiUrl}`, { params }).pipe(
      catchError((err: HttpErrorResponse) => {
        this.toastService.show('Failed to load your schedules.', 'error');
        return throwError(() => err);
      })
    );
  }
}
