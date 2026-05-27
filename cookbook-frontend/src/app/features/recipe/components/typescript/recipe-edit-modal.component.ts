import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RecipeService } from '@shared/services/recipe/recipe.service';
import { ToastService } from '@core/services';
import { NewRecipeIngredientDto, RecipeDto, UpdateRecipeDto } from '@shared/domain/recipe';
import { RecipeStepsComponent } from '@features/recipe/components/typescript/recipe-steps.component';
import {
  RecipeIngredientsFormComponent
} from '@features/recipe/components/typescript/recipe-ingredients-form.component';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';
import { CalculatingPopupComponent } from '@features/recipe/components/typescript/calculating-popup.component';

@Component({
  selector: 'app-recipe-edit-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../html/recipe-edit-modal.component.html',
  styleUrls: ['../scss/recipe-create-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    RecipeStepsComponent,
    RecipeIngredientsFormComponent,
    CalculatingPopupComponent
  ]
})
export class RecipeEditModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<RecipeEditModalComponent>);

  readonly dialogData = inject<{ recipe: RecipeDto; mode: 'edit' | 'createFromHousehold' }>(MAT_DIALOG_DATA);
  readonly recipeData = this.dialogData.recipe;
  readonly isEditMode = this.dialogData.mode === 'edit';

  readonly isSavingChanges = signal(false);
  readonly isSavingAsNew = signal(false);
  readonly isDeleting = signal(false);

  readonly recipeForm = this.fb.group({
    name: [this.recipeData.name, [Validators.required]],
    description: [this.recipeData.description, [Validators.required]],
    durationInMinutes: [this.recipeData.durationInMinutes, [Validators.required, Validators.min(1)]],
    servings: [this.recipeData.servings, [Validators.required, Validators.min(1)]],
    isPublic: [this.recipeData.isPublic, [Validators.required]],
    ingredients: this.fb.array<FormGroup>(
      this.recipeData.ingredients.map(ing => this.fb.group({
        id: [ ing.ingredientId ],
        name: [ ing.name, [ Validators.required ] ],
        quantity: [ ing.quantity, [ Validators.required, Validators.min(0.01) ] ],
        unit: [ ing.unit ]
      }))
    ),
    steps: this.fb.array<FormControl<string>>(
      this.recipeData.steps.map(step => this.fb.control(step, [ Validators.required ]))
    )
  });

  get ingredientsArray(): FormArray<FormGroup> {
    return this.recipeForm.controls.ingredients;
  }

  get stepsArray(): FormArray<FormControl<string>> {
    return this.recipeForm.controls.steps;
  }

  onDurationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.recipeForm.patchValue({ durationInMinutes: Number(input.value) });
  }

  onServingsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.recipeForm.patchValue({ servings: Number(input.value) });
  }

  addIngredient(): void {
    this.ingredientsArray.push(
      this.fb.group({
        id: [ null ],
        name: [ '', [ Validators.required ] ],
        quantity: [ '', [ Validators.required, Validators.min(0.01) ] ],
        unit: [ '' ]
      })
    );
  }

  removeIngredient(index: number): void {
    this.ingredientsArray.removeAt(index);
  }

  addStep(): void {
    this.stepsArray.push(this.fb.control('', [ Validators.required ]));
  }

  removeStep(index: number): void {
    this.stepsArray.removeAt(index);
  }

  onSaveChanges(): void {
    if (this.recipeForm.invalid || this.isActionPending()) return;

    this.isSavingChanges.set(true);
    const updateDto = this.mapFormToUpdateDto();

    this.recipeService.updateRecipe(this.recipeData.id, updateDto).subscribe({
      next: () => {
        this.isSavingChanges.set(false);
        this.toastService.show('Recipe successfully saved!', 'success');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSavingChanges.set(false);
        this.toastService.show('Failed to save the recipe.', 'error');
      }
    });
  }

  onSaveAsNew(): void {
    if (this.recipeForm.invalid || this.isActionPending()) return;

    this.isSavingAsNew.set(true);
    const createDto = this.mapFormToUpdateDto();

    this.recipeService.createRecipe(createDto).subscribe({
      next: (newRecipe: RecipeDto) => {
        this.isSavingAsNew.set(false);
        this.closeModal();
        this.router.navigate([ '/recipes', newRecipe.id ]);
      },
      error: () => {
        this.isSavingAsNew.set(false);
      }
    });
  }

  onDeleteRecipe(): void {
    if (this.isActionPending()) return;

    const confirmRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '400px',
      data: {
        message: `Are you absolutely sure you want to delete "${this.recipeData.name}"? This action cannot be reversed.`
      },
      autoFocus: false
    });

    confirmRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isDeleting.set(true);

      this.recipeService.deleteRecipe(this.recipeData.id).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.toastService.show('Recipe was successfully permanently deleted.', 'success');
          this.dialogRef.close(true);
          this.router.navigate([ '/recipes' ]);
        },
        error: () => {
          this.isDeleting.set(false);
          this.toastService.show('Failed to delete the recipe. Please try again.', 'error');
        }
      });
    });
  }

  onSubmit(): void {
    if (this.recipeForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    const rawFormValues = this.recipeForm.getRawValue();

    const updateDto: UpdateRecipeDto = {
      name: rawFormValues.name,
      description: rawFormValues.description,
      durationInMinutes: rawFormValues.durationInMinutes,
      servings: rawFormValues.servings,
      steps: rawFormValues.steps,
      isPublic: rawFormValues.isPublic,
      ingredients: rawFormValues.ingredients.map((ing: unknown) => {
        const item = ing as { id: string; quantity: number, unit: string };
        return {
          ingredientId: item.id,
          baseQuantity: item.quantity,
          unit: item.unit
        };
      })
    };

    this.recipeService.updateRecipe(this.recipeData.id, updateDto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toastService.show('Recipe successfully updated!', 'success');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.show('Failed to update the recipe.', 'error');
      }
    });
  }

  closeModal(): void {
    this.dialogRef.close(false);
  }

  private isActionPending(): boolean {
    return this.isSavingChanges() || this.isSavingAsNew() || this.isDeleting();
  }

  private mapFormIngredients(ingredients: Array<Record<string, unknown>>): NewRecipeIngredientDto[] {
    return ingredients.map(ing => ({
      ingredientId: String(ing['id']),
      baseQuantity: Number(ing['quantity'])
    }));
  }

  private mapFormToUpdateDto(): UpdateRecipeDto {
    const rawValues = this.recipeForm.getRawValue();
    return {
      name: rawValues.name,
      description: rawValues.description,
      durationInMinutes: rawValues.durationInMinutes,
      servings: rawValues.servings,
      steps: rawValues.steps,
      isPublic: rawValues.isPublic,
      ingredients: this.mapFormIngredients(rawValues.ingredients)
    };
  }
}
