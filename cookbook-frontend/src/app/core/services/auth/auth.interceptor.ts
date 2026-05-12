import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpiredDialogComponent } from '@core/components/typescript/auth/session-expired-dialog.component';
import { AuthService } from '@core/services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        if (req.url.includes('/auth/status')) {
          return throwError(() => error);
        }

        const hasOpenDialog = dialog.openDialogs.some(
          (d) => d.componentInstance instanceof SessionExpiredDialogComponent
        );

        if (!hasOpenDialog) {
          authService.setAuthenticated(false);

          const dialogRef = dialog.open(SessionExpiredDialogComponent, {
            disableClose: true,
            width: '400px',
            role: 'alertdialog',
          });

          dialogRef.afterClosed().subscribe(() => {
            authService.clearAuth();
          });
        }
      }

      return throwError(() => error);
    })
  );
};
