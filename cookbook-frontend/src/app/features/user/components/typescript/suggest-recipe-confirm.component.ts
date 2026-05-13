import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Recipe suggestion</h2>

    <mat-dialog-content>
      Would you like to save
      <strong>{{ data.recipeName }}</strong>
      for {{ data.day }}?
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">
        Cancel
      </button>

      <button mat-flat-button color="primary" (click)="close(true)">
        Save
      </button>
    </mat-dialog-actions>
  `
})
export class SuggestRecipeConfirmComponent {
  readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject(MatDialogRef<SuggestRecipeConfirmComponent>);

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
