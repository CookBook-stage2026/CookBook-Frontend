import {
  Component, ChangeDetectionStrategy, input, output,
  inject, signal, computed, effect
} from '@angular/core';
import { ReactiveFormsModule, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { IngredientService } from '@shared/services/ingredient';
import { Ingredient, Unit } from '@shared/domain/ingredient';

@Component({
  selector: 'app-recipe-ingredients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/recipe-ingredients.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeIngredientsComponent {
  private readonly ingredientService = inject(IngredientService);

  readonly ingredients = input.required<FormArray<FormGroup>>();
  readonly isSubmitting = input.required<boolean>();
  readonly addIngredient = output<void>();
  readonly removeIngredient = output<number>();

  readonly units: Unit[] = [
    'Eetlepel', 'Theelepel', 'Kilogram', 'Gram', 'Liters',
    'Milligram', 'Milliliters', 'Kopje', 'Snufje', 'Stuk', 'Teen'
  ];

  private readonly allIngredients = signal<Ingredient[]>([]);
  readonly searchQueries = signal<string[]>([]);
  readonly dropdownOpen = signal<boolean[]>([]);

  readonly filteredIngredients = computed(() =>
    this.searchQueries().map(query =>
      query.length >= 2
        ? this.allIngredients().filter(i =>
          i.name.toLowerCase().includes(query.toLowerCase())
        )
        : []
    )
  );

  constructor() {
    effect(() => {
      const length = this.ingredients().length;
      this.searchQueries.set(new Array<string>(length).fill(''));
      this.dropdownOpen.set(new Array<boolean>(length).fill(false));
    });

    this.ingredientService.getIngredients(0, 100).subscribe((ingredients: Ingredient[]) => {
      this.allIngredients.set(ingredients);
    });
  }

  add(): void {
    this.searchQueries.update(q => [...q, '']);
    this.dropdownOpen.update(o => [...o, false]);
    this.addIngredient.emit();
  }

  remove(index: number): void {
    this.searchQueries.update(q => q.filter((_, i) => i !== index));
    this.dropdownOpen.update(o => o.filter((_, i) => i !== index));
    this.removeIngredient.emit(index);
  }

  onNameInput(event: Event, index: number): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQueries.update(q => {
      const copy = [...q];
      copy[index] = query;
      return copy;
    });
    this.dropdownOpen.update(o => {
      const copy = [...o];
      copy[index] = query.length >= 2;
      return copy;
    });
  }

  selectIngredient(ingredient: Ingredient, index: number, ctrl: FormGroup): void {
    ctrl.patchValue({ name: ingredient.name, unit: ingredient.unit ?? '' });
    this.searchQueries.update(q => {
      const copy = [...q];
      copy[index] = ingredient.name;
      return copy;
    });
    this.closeDropdown(index);
  }

  closeDropdown(index: number): void {
    this.dropdownOpen.update(o => {
      const copy = [...o];
      copy[index] = false;
      return copy;
    });
  }

  onQuantityInput(event: Event, control: AbstractControl): void {
    let value = Number.parseFloat((event.target as HTMLInputElement).value);
    if (Number.isNaN(value) || value < 0) value = 0;
    control.setValue(value, { emitEvent: false });
  }
}
