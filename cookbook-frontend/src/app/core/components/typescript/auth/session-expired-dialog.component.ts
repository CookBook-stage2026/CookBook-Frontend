import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-expired-dialog',
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Session Expired</h2>
    <mat-dialog-content>
      <p>
        Your session has expired or you do not have permission to access this
        page. Please log in again.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="center">
      <button
        mat-flat-button
        (click)="redirectToLogin()"
        cdkFocusInitial
        class="login-btn">
        Go to Login
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      font-size: 1rem;
      color: var(--text-muted);
    }
    .login-btn {
      width: 100%;
      padding: 24px 0;
      font-size: 1.1rem;
      background-color: var(--element-primary);
      color: var(--element-primary-contrast);
    }
  `
})
export class SessionExpiredDialogComponent {
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<SessionExpiredDialogComponent>);

  redirectToLogin(): void {
    this.dialogRef.close();
    this.router.navigate(['/login']);
  }
}
