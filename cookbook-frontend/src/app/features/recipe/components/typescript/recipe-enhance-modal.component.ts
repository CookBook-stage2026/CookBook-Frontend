import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RecipeDto, UpdateRecipeDto } from '@shared/domain/recipe';
import { RecipeIngredientsComponent } from '@features/recipe/components/typescript/recipe-ingredients-list.component';
import { RecipePreparationComponent } from '@features/recipe/components/typescript/recipe-preparation-list';
import { RecipeService } from '@shared/services/recipe';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-recipe-enhance-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDivider,
    MatProgressSpinner,
    RecipeIngredientsComponent,
    RecipePreparationComponent
  ],
  styles: `
    .modal-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    mat-divider {
      margin: 1rem 0;
    }
  `,
  template: `
    <h2 mat-dialog-title>Enhanced Recipe: {{ recipe.name }}</h2>
    <mat-dialog-content class="modal-content">
      <p class="mat-body-large">{{ recipe.description }}</p>
      <mat-divider />
      <app-recipe-ingredients-list [ingredients]="recipe.ingredients" />
      <mat-divider />
      <app-recipe-preparation-list [steps]="recipe.steps" />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isSaving()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="isSaving()">
        @if (isSaving()) {
          <mat-spinner diameter="20" aria-hidden="true" />
        } @else {
          <span>Save</span>
        }
      </button>
    </mat-dialog-actions>
  `
})
export class RecipeEnhanceModalComponent {
  readonly recipe = inject<RecipeDto>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<RecipeEnhanceModalComponent>);
  readonly recipeService = inject(RecipeService);
  readonly toastService = inject(ToastService);

  readonly isSaving = signal(false);

  save(): void {
    this.isSaving.set(true);

    const updateDto: UpdateRecipeDto = {
      name: this.recipe.name,
      description: this.recipe.description,
      durationInMinutes: this.recipe.durationInMinutes,
      steps: this.recipe.steps,
      servings: this.recipe.servings,
      ingredients: this.recipe.ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        baseQuantity: ing.baseQuantity
      })),
      isPublic: this.recipe.isPublic
    };

    this.recipeService.updateRecipe(this.recipe.id, updateDto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastService.show('Recipe successfully updated!', 'success');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.show('Failed to update the recipe.', 'error');
      }
    });
  }
}
