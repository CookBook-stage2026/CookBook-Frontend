import { ChangeDetectionStrategy, Component, computed, inject, signal, } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RecipeService } from '@shared/services/recipe';
import { RecipeDto } from '@shared/domain/recipe';

type ImportStep = 'url-input' | 'loading' | 'preview';

@Component({
  selector: 'app-recipe-import-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatPrefix,
    MatInput,
    MatIcon,
    MatProgressSpinner,
  ],
  templateUrl: '../html/recipe-import-dialog.component.html',
  styleUrl: '../scss/recipe-import-dialog.component.scss',
})
export class RecipeImportDialogComponent {
  private readonly recipeService = inject(RecipeService);
  private readonly dialogRef = inject(MatDialogRef<RecipeImportDialogComponent>);

  readonly step = signal<ImportStep>('url-input');
  readonly importedRecipe = signal<RecipeDto | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly isUrlStep = computed(() => this.step() === 'url-input');
  readonly isLoadingStep = computed(() => this.step() === 'loading');
  readonly isPreviewStep = computed(() => this.step() === 'preview');

  readonly titleIconName = computed(() =>
    this.isPreviewStep() ? 'check_circle' : 'download'
  );

  readonly dialogTitle = computed((): string => {
    switch (this.step()) {
      case 'url-input':
        return 'Import recipe';
      case 'loading':
        return 'Fetching recipe\u2026';
      case 'preview':
        return 'Recipe preview';
    }
  });

  readonly urlForm = new FormGroup({
    url: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/),
      ],
    }),
  });

  getUrlErrorMessage(): string {
    const ctrl = this.urlForm.controls.url;
    if (ctrl.hasError('required')) return 'URL is required';
    if (ctrl.hasError('pattern')) return 'URL must start with http:// or https://';
    return '';
  }

  importRecipe(): void {
    if (this.urlForm.invalid) return;

    const url = this.urlForm.controls.url.value.trim();
    this.step.set('loading');
    this.errorMessage.set(null);

    this.recipeService.importRecipe(url).subscribe({
      next: (recipe) => {
        this.importedRecipe.set(recipe);
        this.step.set('preview');
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message ?? 'Failed to import recipe. Please try again.');
        this.step.set('url-input');
      },
    });
  }

  confirmAndView(): void {
    this.dialogRef.close(this.importedRecipe());
  }

  dismiss(): void {
    this.dialogRef.close(null);
  }
}
