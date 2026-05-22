import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecipeService } from '@shared/services/recipe/recipe.service';
import { CreateRecipeDto, NewRecipeIngredientDto } from '@shared/domain/recipe';
import { RecipeIngredientsFormComponent } from './recipe-ingredients-form.component';
import { RecipeStepsComponent } from './recipe-steps.component';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-recipe-create-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, RecipeStepsComponent, RecipeIngredientsFormComponent, CdkScrollable ],
  templateUrl: '../html/recipe-create-modal.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss',
  host: {
    '[attr.aria-hidden]': '!isOpen()'
  }
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
    servings: [null, [Validators.required, Validators.min(1)]],
    isPublic: [false],
    steps: this.fb.array([this.fb.control('', Validators.required)]),
    ingredients: this.fb.array([])
  });

  get steps(): FormArray<FormControl> {
    return this.recipeForm.get('steps') as FormArray<FormControl>;
  }

  get ingredients(): FormArray<FormGroup> {
    return this.recipeForm.get('ingredients') as FormArray<FormGroup>;
  }

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.resetForm();
      }
    });
  }

  private resetForm(): void {
    this.recipeForm.reset({
      name: '',
      description: '',
      durationInMinutes: null,
      servings: null,
      isPublic: false,
      steps: [ '' ],
      ingredients: []
    });

    while (this.steps.length > 1) {
      this.steps.removeAt(this.steps.length - 1);
    }
    if (this.steps.length === 0) {
      this.steps.push(this.fb.control('', Validators.required));
    } else {
      this.steps.at(0).setValue('');
    }

    while (this.ingredients.length > 0) {
      this.ingredients.removeAt(0);
    }

    this.isSubmitting.set(false);
  }

  onSubmit(): void {
    if (this.recipeForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const rawFormValue = this.recipeForm.value;

      const mappedIngredients: NewRecipeIngredientDto[] = rawFormValue.ingredients.map((ing: Record<string, unknown>) => ({
        ingredientId: ing['id'],
        baseQuantity: Number(ing['quantity'])
      }));

      const dto: CreateRecipeDto = {
        name: rawFormValue.name,
        description: rawFormValue.description,
        durationInMinutes: rawFormValue.durationInMinutes,
        steps: rawFormValue.steps,
        ingredients: mappedIngredients,
        isPublic: rawFormValue.isPublic,
        servings: Number(rawFormValue.servings)
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
    this.handleIntegerInput(event, 'durationInMinutes');
  }

  onServingsInput(event: Event): void {
    this.handleIntegerInput(event, 'servings');
  }

  private handleIntegerInput(event: Event, controlName: string): void {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value;
    const control = this.recipeForm.get(controlName);

    if (!control) return;

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
}
