import { Injectable, inject } from '@angular/core';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {CreateWeekScheduleRequest, WeekScheduleResponse} from '@shared/domain/user';
import {catchError, tap, throwError} from 'rxjs';
import {ToastService} from '@core/services';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { UpdateUserPreferencesRequest, UserPreferencesDto } from '@shared/domain/user';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from '@core/services';
import {CreateWeekScheduleRequest, WeekScheduleResponse} from '@shared/domain/week-schedule';

@Injectable({ providedIn: 'root' })
export class WeekScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly baseUrl = '/api/user';
  private readonly toastService = inject(ToastService);

  getPreferences(): Observable<UserPreferencesDto> {
    return this.http.get<UserPreferencesDto>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(request: UpdateUserPreferencesRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/preferences`, request);
    }
  createSchedule(request: CreateWeekScheduleRequest) {
    return this.http.post<WeekScheduleResponse>(`${this.baseUrl}/schedule`, request).pipe(
      tap(response => this.toastService.show('Schedule created successfully.', 'success')),
      catchError(err => {
        const message = err.error?.detail ?? 'Failed to create a schedule.';
        this.toastService.show(message, 'error');
        return throwError(() => err);
      })
    );
  }
}
