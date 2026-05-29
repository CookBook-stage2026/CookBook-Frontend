import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Are you sure?</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="ref.close(false)">Cancel</button>
      <button mat-flat-button class="confirm-btn" (click)="ref.close(true)">Confirm</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .confirm-btn {
        background-color: var(--revoke-bg);
        color: var(--revoke-text);
        border: 1px solid var(--revoke-border);
      }

      .confirm-btn:hover:not([disabled]) {
        background-color: var(--revoke-hover-bg);
        color: var(--revoke-hover-text);
        border-color: var(--revoke-hover-border);
      }

      .confirm-btn:focus-visible {
        outline: 2px solid var(--revoke-focus-ring);
        outline-offset: 2px;
      }
    `
  ]
})
export class ConfirmDeleteComponent {
  readonly data = inject(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef);
}
