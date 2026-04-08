import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/auth';
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  loginWith(provider: 'google' | 'github' | 'microsoft', rememberMe: boolean) {
    const redirectUri = `${globalThis.location.origin}/auth/callback`;
    sessionStorage.setItem('oauth_provider', provider);
    sessionStorage.setItem('remember_me', String(rememberMe));

    this.http.get<{ url: string }>(
      `${this.apiUrl}/${provider}/url`,
      { params: { redirectUri } }
    ).subscribe(({ url }) => globalThis.location.href = url);
  }

  handleCallback(code: string): Observable<void> {
    const provider = sessionStorage.getItem('oauth_provider');
    const rememberMe = sessionStorage.getItem('remember_me') === 'true';
    const redirectUri = `${globalThis.location.origin}/auth/callback`;

    return this.http.post<{ accessToken: string; refreshToken: string; email: string; displayName: string }>(
      `${this.apiUrl}/${provider}/callback`,
      { code, redirectUri, rememberMe }
    ).pipe(
      tap(res => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(this.accessTokenKey, res.accessToken);

        if (res.refreshToken) {
          storage.setItem(this.refreshTokenKey, res.refreshToken);
        }

        sessionStorage.removeItem('oauth_provider');
        sessionStorage.removeItem('remember_me');
      }),
      map(() => void 0)
    );
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
