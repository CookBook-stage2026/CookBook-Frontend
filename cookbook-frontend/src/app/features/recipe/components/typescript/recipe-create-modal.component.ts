import { Component, ChangeDetectionStrategy, inject, output, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {RecipeService} from '@shared/services/recipe/recipe.service';
import {CreateRecipeDto} from '@shared/domain/recipe';
import {Ingredient} from '@shared/domain/ingredient/ingredient.model';
import {IngredientService} from '@shared/services/ingredient/ingredient.service';

@Component({
  selector: 'app-recipe-create-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/recipe-create-modal.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeCreateModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private ingredientService = inject(IngredientService);

  closeModal = output<void>();
  recipeCreated = output<void>();

  availableIngredients = signal<Ingredient[]>([]);

  recipeForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    durationInMinutes: [0, [Validators.required, Validators.min(1)]],
    steps: this.fb.array([this.fb.control('', Validators.required)]),
    ingredients: this.fb.array([])
  });

  get steps() { return this.recipeForm.get('steps') as FormArray; }
  get ingredients() { return this.recipeForm.get('ingredients') as FormArray; }

  ngOnInit() {
    this.ingredientService.getIngredients(0, 20).subscribe(ingredients => {
      this.availableIngredients.set(ingredients);
    });
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
      ingredientId: ['', Validators.required],
      isScalable: [true],
      baseQuantity: [1, [Validators.required, Validators.min(0.1)]]
    });
    this.ingredients.push(ingredientGroup);
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  onSubmit() {
    if (this.recipeForm.valid) {
      const formValue = this.recipeForm.value as CreateRecipeDto;

      this.recipeService.createRecipe(formValue).subscribe({
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
