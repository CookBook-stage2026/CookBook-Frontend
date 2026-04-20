import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {SessionExpiredDialogComponent} from '@core/components/typescript/auth/session-expired-dialog.component';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        (error.status === 401 || error.status === 403)
      ) {
        const hasOpenDialog = dialog.openDialogs.some(
          (d) => d.componentInstance instanceof SessionExpiredDialogComponent
        );

        if (!hasOpenDialog) {
          dialog.open(SessionExpiredDialogComponent, {
            disableClose: true,
            width: '400px',
            role: 'alertdialog',
          });
        }
      }

      return throwError(() => error);
    })
  );
};
