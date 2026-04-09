import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  const isRefreshRequest = req.url.includes('/auth/refresh');

  if (accessToken && !isRefreshRequest) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if ((error.status === 401 || error.status === 403) && !isRefreshRequest) {

        const refreshToken = authService.getRefreshToken();

        if (!refreshToken) {
          authService.logout();
          return throwError(() => error);
        }

        return authService.refreshSession().pipe(
          switchMap((res) => {
            const clonedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            return next(clonedReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      if ((error.status === 401 || error.status === 403) && isRefreshRequest) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
