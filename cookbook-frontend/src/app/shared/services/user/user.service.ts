import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../../environment';
import { UpdateUserPreferencesRequest, User, UserPreferencesDto } from '@shared/domain/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private readonly currentUser$ = this.http.get<User>(`${this.apiUrl}/me`).pipe(
    shareReplay(1)
  );

  getPreferences(): Observable<UserPreferencesDto> {
    return this.http.get<UserPreferencesDto>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(request: UpdateUserPreferencesRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/preferences`, request);
  }

  getCurrentUser(): Observable<User> {
    return this.currentUser$;
  }
}
