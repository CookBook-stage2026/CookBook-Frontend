import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Observable, of} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  loginWith(provider: 'google' | 'github' | 'microsoft'): void {
    globalThis.location.href = `${environment.authRedirectUrl}/oauth2/authorization/${provider}`;
  }

  handleCallback(): Observable<void> {
    globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
    return of(void 0);
  }

  isLoggedIn(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/status`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
