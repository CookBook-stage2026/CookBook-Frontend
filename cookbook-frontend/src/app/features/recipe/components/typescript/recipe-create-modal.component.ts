import { Component, ChangeDetectionStrategy, inject, output, signal, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { RecipeService } from '@shared/services/recipe/recipe.service';
import { CreateRecipeDto, CreateRecipeIngredientDto } from '@shared/domain/recipe';
import { RecipeIngredientsFormComponent } from './recipe-ingredients-form.component';
import { RecipeStepsComponent } from './recipe-steps.component';

@Component({
  selector: 'app-recipe-create-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RecipeStepsComponent, RecipeIngredientsFormComponent],
  templateUrl: '../html/recipe-create-modal.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeCreateModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeService);

  readonly recipeCreated = output<void>();
  readonly closeModal = output<void>();
  readonly isSubmitting = signal(false);
  readonly isOpen = input<boolean>(false);

  readonly recipeForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    durationInMinutes: [null, [Validators.required, Validators.min(1)]],
    steps: this.fb.array([this.fb.control('', Validators.required)]),
    ingredients: this.fb.array([])
  });

  get steps(): FormArray<FormControl> {
    return this.recipeForm.get('steps') as FormArray<FormControl>;
  }

  get ingredients(): FormArray<FormGroup> {
    return this.recipeForm.get('ingredients') as FormArray<FormGroup>;
  }

  onSubmit(): void {
    if (this.recipeForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const rawFormValue = this.recipeForm.value;

      const mappedIngredients: CreateRecipeIngredientDto[] = rawFormValue.ingredients.map((ing: any) => ({
        ingredientId: ing.id,
        baseQuantity: Number(ing.quantity)
      }));

      const dto: CreateRecipeDto = {
        name: rawFormValue.name,
        description: rawFormValue.description,
        durationInMinutes: rawFormValue.durationInMinutes,
        steps: rawFormValue.steps,
        ingredients: mappedIngredients,
        servings: 1
      };

      this.recipeService.createRecipe(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.recipeCreated.emit();
          this.closeModal.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.recipeForm.markAllAsTouched();
    }
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
      id: [null, Validators.required],
      name: ['', Validators.required],
      quantity: [null as number | null, [Validators.required, Validators.min(0.1)]],
      unit: ['', Validators.required]
    }));
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  onDurationInput(event: Event): void {
    let value = Number.parseInt((event.target as HTMLInputElement).value, 10);
    if (Number.isNaN(value) || value < 1) value = 1;
    this.recipeForm.get('durationInMinutes')?.setValue(value, { emitEvent: false });
  }
}
