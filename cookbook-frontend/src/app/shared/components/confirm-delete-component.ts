import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
      <button mat-flat-button color="warn" (click)="ref.close(true)">Confirm</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDeleteComponent {
  readonly data = inject(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef);
}
