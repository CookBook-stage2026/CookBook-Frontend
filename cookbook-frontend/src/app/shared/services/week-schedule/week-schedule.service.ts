import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from '@core/services';
import { environment } from '../../../../environment';
import {
  CreateWeekScheduleRequest, ScheduleContext,
  UpdateWeekScheduleRequest,
  WeekScheduleResponse
} from '@shared/domain/week-schedule';

@Injectable({ providedIn: 'root' })
export class WeekScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/schedules`;
  private readonly toastService = inject(ToastService);

  private getContextUrl(context: ScheduleContext): string {
    return context.type === 'personal'
      ? `${this.apiUrl}/personal`
      : `${this.apiUrl}/households/${context.householdId}`;
  }

  createSchedule(context: ScheduleContext, request: CreateWeekScheduleRequest) {
    return this.http.post<WeekScheduleResponse>(this.getContextUrl(context), request).pipe(
      tap(() => this.toastService.show('Schedule created successfully.', 'success')),
      catchError(err => {
        const message = err.error?.detail ?? 'Failed to create a schedule.';
        this.toastService.show(message, 'error');
        return throwError(() => err);
      })
    );
  }

  updateSchedule(id: string, request: UpdateWeekScheduleRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  getSchedules(context: ScheduleContext, from?: string, to?: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<WeekScheduleResponse[]>(this.getContextUrl(context), { params }).pipe(
      catchError((err: HttpErrorResponse) => {
        this.toastService.show('Failed to load your schedules.', 'error');
        return throwError(() => err);
      })
    );
  }

  deleteSchedule(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  suggestRecipeForDay(context: ScheduleContext, date: string) {
    return this.http.get<WeekScheduleResponse>(`${this.getContextUrl(context)}/suggest/day/${date}`);
  }

  suggestWeekSchedule(context: ScheduleContext, weekStartDate: string) {
    return this.http.get<WeekScheduleResponse>(`${this.getContextUrl(context)}/suggest/week/${weekStartDate}`);
  }
}
