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
import { RecipeService } from '@shared/services/recipe';
import { ToastService } from '@core/services';
import { NewRecipeIngredientDto, RecipeDto, UpdateRecipeDto } from '@shared/domain/recipe';
import { RecipeStepsComponent } from '@features/recipe/components/typescript/recipe-steps.component';
import {
  RecipeIngredientsFormComponent
} from '@features/recipe/components/typescript/recipe-ingredients-form.component';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-edit-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../html/recipe-edit-modal.component.html',
  styleUrls: ['../scss/recipe-create-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    RecipeStepsComponent,
    RecipeIngredientsFormComponent
  ]
})
export class RecipeEditModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<RecipeEditModalComponent>);
  readonly recipeData = inject<RecipeDto>(MAT_DIALOG_DATA);

  readonly isSubmitting = signal(false);
  readonly ingredients = signal<NewRecipeIngredientDto[]>([]);
  readonly steps = signal<string[]>([]);

  readonly recipeForm = this.fb.group({
    name: [this.recipeData.name, [Validators.required]],
    description: [this.recipeData.description, [Validators.required]],
    durationInMinutes: [this.recipeData.durationInMinutes, [Validators.required, Validators.min(1)]],
    servings: [this.recipeData.servings, [Validators.required, Validators.min(1)]],
    isPublic: [this.recipeData.isPublic, [Validators.required]],
    ingredients: this.fb.array<FormGroup>([]),
    steps: this.fb.array<FormControl<string>>([])
  });

  get ingredientsArray(): FormArray<FormGroup> {
    return this.recipeForm.controls.ingredients;
  }

  get stepsArray(): FormArray<FormControl<string>> {
    return this.recipeForm.controls.steps;
  }

  constructor() {
    this.recipeData.ingredients.forEach(ing => {
      this.ingredientsArray.push(
        this.fb.group({
          id: [ing.ingredientId],
          name: [ing.name, [Validators.required]],
          quantity: [ing.baseQuantity, [Validators.required, Validators.min(0.01)]],
          unit: [ing.unit]
        })
      );
    });

    this.recipeData.steps.forEach(step => {
      this.stepsArray.push(this.fb.control(step, [Validators.required]));
    });
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
        id: [null],
        name: ['', [Validators.required]],
        quantity: ['', [Validators.required, Validators.min(0.01)]],
        unit: ['']
      })
    );
  }

  removeIngredient(index: number): void {
    this.ingredientsArray.removeAt(index);
  }

  addStep(): void {
    this.stepsArray.push(this.fb.control('', [Validators.required]));
  }

  removeStep(index: number): void {
    this.stepsArray.removeAt(index);
  }

  onDeleteRecipe(): void {
    const confirmRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '400px',
      data: {
        message: `Are you absolutely sure you want to delete "${this.recipeData.name}"? This action cannot be reversed.`
      },
      autoFocus: false
    });

    confirmRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isSubmitting.set(true);

      this.recipeService.deleteRecipe(this.recipeData.id).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toastService.show('Recipe was successfully permanently deleted.', 'success');
          this.dialogRef.close(true);
          this.router.navigate(['/recipes']);
        },
        error: () => {
          this.isSubmitting.set(false);
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
        const item = ing as { id: string; quantity: number };
        return {
          ingredientId: item.id,
          baseQuantity: item.quantity
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
}
