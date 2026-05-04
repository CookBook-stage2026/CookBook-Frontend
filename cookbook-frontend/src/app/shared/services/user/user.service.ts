import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { UpdateUserPreferencesRequest, UserPreferencesDto } from '@shared/domain/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getPreferences(): Observable<UserPreferencesDto> {
    return this.http.get<UserPreferencesDto>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(request: UpdateUserPreferencesRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/preferences`, request);
  }
}
