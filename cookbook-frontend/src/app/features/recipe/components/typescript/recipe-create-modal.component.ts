import { Component, ChangeDetectionStrategy, inject, output, } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RecipeService } from '@shared/services/recipe/recipe.service';
import { CreateRecipeDto, IngredientDto } from '@shared/domain/recipe';

@Component({
  selector: 'app-recipe-create-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/recipe-create-modal.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeCreateModalComponent {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);

  closeModal = output<void>();
  recipeCreated = output<void>();

  recipeForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    durationInMinutes: [null, [Validators.required, Validators.min(1)]],
    steps: this.fb.array([this.fb.control('', Validators.required)]),
    ingredients: this.fb.array([])
  });

  get steps() { return this.recipeForm.get('steps') as FormArray; }
  get ingredients() { return this.recipeForm.get('ingredients') as FormArray; }

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

  onSubmit() {
    if (this.recipeForm.valid) {
      const formValue = this.recipeForm.value;

      const ingredientsMap: { [key: string]: IngredientDto } = {};
      formValue.ingredients.forEach((ingredient: any, index: number) => {
        ingredientsMap[`ingredient_${index + 1}`] = {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        };
      });

      const createRecipeDto: CreateRecipeDto = {
        name: formValue.name,
        description: formValue.description,
        durationInMinutes: formValue.durationInMinutes,
        steps: formValue.steps,
        ingredients: ingredientsMap
      };

      this.recipeService.createRecipe(createRecipeDto).subscribe({
        next: () => {
          this.recipeCreated.emit();
          this.closeModal.emit();
        },
        error: (err) => console.error('Failed to create recipe', err)
      });
    } else {
      this.recipeForm.markAllAsTouched();
    }
  }
}
