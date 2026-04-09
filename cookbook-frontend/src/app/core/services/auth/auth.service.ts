import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {environment} from '../../../../environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly accessTokenKey = 'access_token';

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  loginWith(provider: 'google' | 'github' | 'microsoft', rememberMe: boolean): void {
    globalThis.location.href = `${environment.authRedirectUrl}/oauth2/authorization/${provider}?rememberMe=${rememberMe}`;
  }

  handleCallback(): Observable<void> {
    const match = new RegExp(/(^| )access_token=([^;]+)/).exec(document.cookie);
    const accessToken = match ? match[2] : null;

    if (!accessToken) {
      throw new Error('No access token received from cookies');
    }

    localStorage.setItem(this.accessTokenKey, accessToken);

    document.cookie = 'access_token=; Max-Age=-99999999; path=/';

    globalThis.history.replaceState({}, document.title, globalThis.location.pathname);

    return new Observable(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }

  refreshSession(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.accessTokenKey, res.accessToken);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    // Note: To fully log out, you should eventually call a backend endpoint here
    // to delete the HttpOnly refresh_token cookie and remove it from the database.
    this.router.navigate(['/login']);
  }
}
