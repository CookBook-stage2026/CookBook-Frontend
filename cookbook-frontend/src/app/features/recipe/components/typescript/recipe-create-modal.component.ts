import { Component, ChangeDetectionStrategy, inject, output, signal, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { RecipeService } from '@shared/services/recipe/recipe.service';
import { CreateRecipeDto, IngredientDto } from '@shared/domain/recipe';
import { RecipeIngredientsComponent } from './recipe-ingredients.component';
import { RecipeStepsComponent } from './recipe-steps.component';

@Component({
  selector: 'app-recipe-create-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RecipeIngredientsComponent, RecipeStepsComponent],
  templateUrl: '../html/recipe-create-modal.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeCreateModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeService);

  closeModal = output<void>();
  recipeCreated = output<void>();
  isSubmitting = signal(false);
  isOpen = input<boolean>(false);

  recipeForm: FormGroup = this.fb.group({
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

  onSubmit() {
    if (this.recipeForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formValue = this.recipeForm.value;
      const createRecipeDto = this.transformToDto(formValue);

      this.recipeService.createRecipe(createRecipeDto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.recipeCreated.emit();
          this.closeModal.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Failed to create recipe', err);
        }
      });
    } else {
      this.recipeForm.markAllAsTouched();
    }
  }

  private transformToDto(formValue: any): CreateRecipeDto {
    const ingredientsMap: { [key: string]: IngredientDto } = {};
    formValue.ingredients.forEach((ingredient: any, index: number) => {
      ingredientsMap[`ingredient_${index + 1}`] = {
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit
      };
    });

    return {
      name: formValue.name,
      description: formValue.description,
      durationInMinutes: formValue.durationInMinutes,
      steps: formValue.steps,
      ingredients: ingredientsMap
    };
  }

  addStep() {
    this.steps.push(this.fb.control('', Validators.required));
  }

  removeStep(index: number) {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  addIngredient() {
    const ingredientGroup = this.fb.group({
      name: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.1)]],
      unit: ['', Validators.required]
    });
    this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  onDurationInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number.parseFloat(input.value);
    if (Number.isNaN(value)) value = 1;
    if (value < 1) value = 1;
    this.recipeForm.get('durationInMinutes')?.setValue(value, { emitEvent: false });
  }
}
