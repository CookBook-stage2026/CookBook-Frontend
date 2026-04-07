import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {map, Observable, tap} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/auth';
  private readonly tokenKey = 'jwt';

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  loginWith(provider: 'google' | 'github') {
    const redirectUri = `${globalThis.location.origin}/auth/callback`;
    sessionStorage.setItem('oauth_provider', provider);

    this.http.get<{ url: string }>(
      `${this.apiUrl}/${provider}/url`,
      { params: { redirectUri } }
    ).subscribe(({ url }) => globalThis.location.href = url);
  }

  handleCallback(code: string): Observable<void> {
    const provider = sessionStorage.getItem('oauth_provider');
    const redirectUri = `${globalThis.location.origin}/auth/callback`;

    return this.http.post<{ token: string; email: string; displayName: string }>(
      `${this.apiUrl}/${provider}/callback`,
      { code, redirectUri }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        sessionStorage.removeItem('oauth_provider');
      }),
      map(() => void 0)
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
}
