import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticated = false;
  private authChecked = false;

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  loginWith(provider: 'google' | 'github' | 'microsoft'): void {
    globalThis.location.href = `${environment.authRedirectUrl}/oauth2/authorization/${provider}`;
  }

  handleCallback(): Observable<void> {
    globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
    this.authChecked = false;
    this.checkAuthStatus().subscribe();
    return of(void 0);
  }

  isLoggedIn(): Observable<boolean> {
    if (this.authChecked && this.isAuthenticated) {
      return of(true);
    }

    return this.checkAuthStatus();
  }

  private checkAuthStatus(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/status`)
      .pipe(
        map(response => {
          this.isAuthenticated = response.authenticated;
          this.authChecked = true;
          return response.authenticated;
        }),
        catchError(() => {
          this.isAuthenticated = false;
          this.authChecked = true;
          return of(false);
        })
      );
  }

  setAuthenticated(value: boolean): void {
    this.isAuthenticated = value;
    if (!value) {
      this.authChecked = false;
    }
  }

  clearAuth(): void {
    this.setAuthenticated(false);
    this.router.navigate(['/login']);
  }
}
