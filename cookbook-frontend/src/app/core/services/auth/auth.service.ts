import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/auth';
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  loginWith(provider: 'google' | 'github' | 'microsoft', rememberMe: boolean): void {
    sessionStorage.setItem('remember_me', String(rememberMe));

    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  }

  handleCallback(): Observable<void> {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const rememberMe = sessionStorage.getItem('remember_me') === 'true';

    if (!accessToken) {
      throw new Error('No access token received');
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.accessTokenKey, accessToken);
    if (refreshToken) {
      storage.setItem(this.refreshTokenKey, refreshToken);
    }

    sessionStorage.removeItem('remember_me');
    window.history.replaceState({}, document.title, window.location.pathname);

    return new Observable(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }

  refreshSession(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();

    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.apiUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap(res => {
        const storage = localStorage.getItem(this.refreshTokenKey) ? localStorage : sessionStorage;
        storage.setItem(this.accessTokenKey, res.accessToken);
        if (res.refreshToken) {
          storage.setItem(this.refreshTokenKey, res.refreshToken);
        }
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey) || sessionStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey) || sessionStorage.getItem(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    this.router.navigate(['/login']);
  }
}
