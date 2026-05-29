import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { catchError, of, switchMap, tap } from 'rxjs';

import { RecipeService } from '@shared/services/recipe/recipe.service';
import { ToastService } from '@core/services';
import { CreateRecipeDto, NewRecipeIngredientDto, RecipeDto, UpdateRecipeDto } from '@shared/domain/recipe';
import { RecipeIngredientsFormComponent } from './recipe-ingredients-form.component';
import { RecipeStepsComponent } from './recipe-steps.component';
import { CalculatingPopupComponent } from '@features/recipe/components/typescript/calculating-popup.component';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';

@Component({
  selector: 'app-recipe-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RecipeStepsComponent,
    RecipeIngredientsFormComponent,
    CdkScrollable,
    CalculatingPopupComponent,
    MatCheckbox,
    MatProgressSpinner
  ],
  templateUrl: '../html/recipe-form-modal.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss',
  host: {
    '[attr.aria-hidden]': '!isOpen()'
  }
})
export class RecipeFormModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly isOpen = input<boolean>(false);
  readonly recipe = input<RecipeDto | null>(null);

  readonly recipeSaved = output<void>();
  readonly closeModal = output<void>();

  readonly isEditMode = computed(() => this.recipe() !== null);

  readonly isSubmitting = signal(false);
  readonly isSavingAsNew = signal(false);
  readonly isDeleting = signal(false);
  readonly calculateMacrosOption = signal(false);

  readonly isActionPending = computed(() =>
    this.isSubmitting() || this.isSavingAsNew() || this.isDeleting()
  );

  readonly recipeForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    durationInMinutes: [null as number | null, [Validators.required, Validators.min(1)]],
    servings: [null as number | null, [Validators.required, Validators.min(1)]],
    isPublic: [false],
    steps: this.fb.array<FormControl<string>>([]),
    ingredients: this.fb.array<FormGroup>([])
  });

  get steps(): FormArray<FormControl<string>> {
    return this.recipeForm.controls.steps;
  }

  get ingredients(): FormArray<FormGroup> {
    return this.recipeForm.controls.ingredients;
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const currentRecipe = this.recipe();

      if (open) {
        untracked(() => {
          if (currentRecipe) {
            this.populateForm(currentRecipe);
          } else {
            this.resetForm();
          }
        });
      }
    });
  }

  private resetForm(): void {
    this.recipeForm.reset({
      name: '',
      description: '',
      durationInMinutes: null,
      servings: null,
      isPublic: false
    });

    this.steps.clear();
    this.steps.push(this.fb.control('', Validators.required));

    this.ingredients.clear();

    this.isSubmitting.set(false);
    this.isSavingAsNew.set(false);
    this.isDeleting.set(false);
    this.calculateMacrosOption.set(false);
  }

  private populateForm(recipeData: RecipeDto): void {
    this.recipeForm.patchValue({
      name: recipeData.name,
      description: recipeData.description,
      durationInMinutes: recipeData.durationInMinutes,
      servings: recipeData.servings,
      isPublic: recipeData.isPublic
    });

    this.steps.clear();
    recipeData.steps.forEach(step => {
      this.steps.push(this.fb.control(step, Validators.required));
    });

    this.ingredients.clear();
    recipeData.ingredients.forEach(ing => {
      this.ingredients.push(this.fb.group({
        id: [ing.ingredientId],
        name: [ing.name, Validators.required],
        quantity: [ing.quantity, [Validators.required, Validators.min(0.01)]],
        unit: [ing.unit]
      }));
    });
  }

  onSubmit(): void {
    if (this.recipeForm.invalid || this.ingredients.length === 0 || this.isActionPending()) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    let macrosFailed = false;

    if (this.isEditMode()) {
      const dto = this.mapFormToDto();
      const recipeId = this.recipe()!.id;

      this.recipeService.updateRecipe(recipeId, dto).pipe(
        switchMap(() => {
          if (this.calculateMacrosOption()) {
            return this.recipeService.calculateMacros(recipeId).pipe(
              catchError(() => {
                macrosFailed = true;
                return of(void 0);
              })
            );
          }
          return of(void 0);
        })
      ).subscribe({
        next: () => this.handleSuccess(macrosFailed, 'updated'),
        error: () => this.handleError('update')
      });

    } else {
      const dto = this.mapFormToDto();

      this.recipeService.createRecipe(dto).pipe(
        switchMap((newRecipe) => {
          if (this.calculateMacrosOption()) {
            return this.recipeService.calculateMacros(newRecipe.id).pipe(
              catchError(() => {
                macrosFailed = true;
                return of(void 0);
              })
            );
          }
          return of(void 0);
        })
      ).subscribe({
        next: () => this.handleSuccess(macrosFailed, 'created'),
        error: () => this.handleError('create')
      });
    }
  }

  onSaveAsNew(): void {
    if (this.recipeForm.invalid || this.ingredients.length === 0 || this.isActionPending()) return;

    this.isSavingAsNew.set(true);
    const createDto = this.mapFormToDto();
    let macrosFailed = false;

    this.recipeService.createRecipe(createDto).pipe(
      switchMap((newRecipe: RecipeDto) => {
        if (this.calculateMacrosOption()) {
          return this.recipeService.calculateMacros(newRecipe.id).pipe(
            tap(() => of(newRecipe)),
            catchError(() => {
              macrosFailed = true;
              return of(newRecipe);
            }),
            switchMap(() => of(newRecipe))
          );
        }
        return of(newRecipe);
      })
    ).subscribe({
      next: (newRecipe: RecipeDto) => {
        this.isSavingAsNew.set(false);
        if (macrosFailed) {
          this.toastService.show('Macro calculation encountered an error.', 'error');
        }
        this.toastService.show('Recipe successfully copied!', 'success');
        this.closeModal.emit();
        this.router.navigate(['/recipes', newRecipe.id]);
      },
      error: () => {
        this.isSavingAsNew.set(false);
        this.toastService.show('An error occurred during duplication.', 'error');
      }
    });
  }

  onDeleteRecipe(): void {
    if (this.isActionPending() || !this.isEditMode()) return;

    const currentRecipe = this.recipe();
    if (!currentRecipe) return;

    const confirmRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '400px',
      data: {
        message: `Are you absolutely sure you want to delete "${currentRecipe.name}"? This action cannot be reversed.`
      },
      autoFocus: false
    });

    confirmRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isDeleting.set(true);

      this.recipeService.deleteRecipe(currentRecipe.id).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.toastService.show('Recipe was successfully permanently deleted.', 'success');
          this.closeModal.emit();
          this.router.navigate(['/recipes']);
        },
        error: () => {
          this.isDeleting.set(false);
          this.toastService.show('Failed to delete the recipe. Please try again.', 'error');
        }
      });
    });
  }

  addStep(): void {
    this.steps.push(this.fb.control('', Validators.required));
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  addIngredient(): void {
    this.ingredients.push(this.fb.group({
      id: [''],
      name: ['', Validators.required],
      quantity: [null as number | null, [Validators.required, Validators.min(0.01)]],
      unit: ['', Validators.required]
    }));
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  onDurationInput(event: Event): void {
    this.handleIntegerInput(event, 'durationInMinutes');
  }

  onServingsInput(event: Event): void {
    this.handleIntegerInput(event, 'servings');
  }

  private handleIntegerInput(event: Event, controlName: 'durationInMinutes' | 'servings'): void {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value;
    const control = this.recipeForm.controls[controlName];

    if (rawValue === '') {
      control.setValue(null, { emitEvent: false });
      return;
    }

    const value = Number.parseInt(rawValue, 10);
    if (Number.isNaN(value) || value < 1) {
      control.setValue(1, { emitEvent: false });
      target.value = '1';
      return;
    }

    control.setValue(value, { emitEvent: false });
  }

  private mapFormToDto(): CreateRecipeDto | UpdateRecipeDto {
    const rawValues = this.recipeForm.getRawValue();

    const mappedIngredients: NewRecipeIngredientDto[] = rawValues.ingredients.map(ing => ({
      ingredientId: ing["id"] ? String(ing["id"]) : '',
      baseQuantity: Number(ing["quantity"]),
      unit: String(ing["unit"])
    }));

    return {
      name: rawValues.name,
      description: rawValues.description,
      durationInMinutes: Number(rawValues.durationInMinutes),
      servings: Number(rawValues.servings),
      steps: rawValues.steps,
      isPublic: rawValues.isPublic,
      ingredients: mappedIngredients
    };
  }

  private handleSuccess(macrosFailed: boolean, action: 'created' | 'updated'): void {
    this.isSubmitting.set(false);
    if (macrosFailed) {
      this.toastService.show('Macro calculation encountered an error.', 'error');
    }
    this.toastService.show(`Recipe successfully ${action}!`, 'success');
    this.recipeSaved.emit();
    this.closeModal.emit();
  }

  private handleError(action: 'create' | 'update'): void {
    this.isSubmitting.set(false);
    this.toastService.show(`Failed to ${action} the recipe.`, 'error');
  }
}
