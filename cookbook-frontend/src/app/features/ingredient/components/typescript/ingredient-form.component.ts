import { Component, output, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ingredient, Unit } from '@shared/domain/ingredient';

@Component({
  selector: 'app-ingredient-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/ingredient-form.component.html',
  styleUrl: '../scss/ingredient-form.component.scss'
})
export class IngredientFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly ingredientSubmitted = output<Ingredient>();
  readonly isSubmitting = input(false);

  readonly units: Unit[] = [
    'Eetlepel', 'Theelepel', 'Kilogram', 'Gram', 'Liters',
    'Milligram', 'Milliliters', 'Kopje', 'Snufje', 'Stuk', 'Teen'
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    unit: [null as Unit | null]
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.ingredientSubmitted.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.form.reset({ name: '', description: '', unit: null });
  }
}
