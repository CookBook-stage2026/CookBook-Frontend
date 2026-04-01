import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import {ReactiveFormsModule, FormArray, FormGroup, AbstractControl} from '@angular/forms';

@Component({
  selector: 'app-recipe-ingredients',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/recipe-ingredients.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeIngredientsComponent {
  ingredients = input.required<FormArray<FormGroup>>();
  isSubmitting = input.required<boolean>();
  addIngredient = output<void>();
  removeIngredient = output<number>();

  add() {
    this.addIngredient.emit();
  }

  remove(index: number) {
    this.removeIngredient.emit(index);
  }

  onQuantityInput(event: Event, control: AbstractControl) {
    let value = parseFloat((event.target as HTMLInputElement).value);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    control.setValue(value, { emitEvent: false });
  }
}
