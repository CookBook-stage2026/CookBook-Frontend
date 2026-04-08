import {
  Component, ChangeDetectionStrategy, input, output, inject, signal, OnDestroy
} from '@angular/core';
import { ReactiveFormsModule, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { IngredientService } from '@shared/services/ingredient';
import { Ingredient } from '@shared/domain/ingredient';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-recipe-ingredients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatAutocompleteModule],
  templateUrl: '../html/recipe-ingredients-form.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeIngredientsFormComponent implements OnDestroy {
  private readonly ingredientService = inject(IngredientService);

  readonly ingredients = input.required<FormArray<FormGroup>>();
  readonly isSubmitting = input.required<boolean>();
  readonly addIngredient = output<void>();
  readonly removeIngredient = output<number>();

  readonly allIngredients = signal<Ingredient[]>([]);

  private readonly searchSubject = new Subject<string>();
  private readonly searchSubscription: Subscription;

  constructor() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.ingredientService.searchIngredients(query))
    ).subscribe(results => {
      this.allIngredients.set(results);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  add(): void {
    this.addIngredient.emit();
  }

  remove(index: number): void {
    this.removeIngredient.emit(index);
  }

  onNameChange(event: Event, ctrl: AbstractControl): void {
    const inputName = (event.target as HTMLInputElement).value;
    this.searchSubject.next(inputName);

    const matched = this.allIngredients().find(i => i.name.toLowerCase() === inputName.trim().toLowerCase());

    if (matched) {
      ctrl.patchValue({
        id: matched.id,
        unit: matched.unit ?? ''
      });
    } else {
      ctrl.patchValue({
        id: null,
        unit: ''
      });
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent, ctrl: AbstractControl): void {
    const selectedName = event.option.value;
    const matched = this.allIngredients().find(i => i.name === selectedName);

    if (matched) {
      ctrl.patchValue({
        id: matched.id,
        unit: matched.unit ?? ''
      });
    }
  }

  onQuantityInput(event: Event, control: AbstractControl): void {
    const inputElement = event.target as HTMLInputElement;
    let sanitizedValue = inputElement.value.replaceAll(/[^0-9.,]/g, '');

    const decimalCount = (sanitizedValue.match(/[.,]/g) || []).length;
    if (decimalCount > 1) {
      sanitizedValue = sanitizedValue.slice(0, -1);
    }

    if (inputElement.value !== sanitizedValue) {
      inputElement.value = sanitizedValue;
    }

    const numericValue = Number.parseFloat(sanitizedValue.replace(',', '.'));
    if (!Number.isNaN(numericValue) && numericValue >= 0) {
      control.setValue(numericValue, { emitEvent: false });
    } else {
      control.setValue(null, { emitEvent: false });
    }
  }

  getDisplayUnit(ctrl: AbstractControl): string {
    const unitEnum = ctrl.get('unit')?.value;
    const quantity = ctrl.get('quantity')?.value || 0;

    if (!unitEnum) return '';

    const isPlural = quantity !== 1;

    switch (unitEnum.toUpperCase()) {
      case 'GRAM': return 'Gram';
      case 'KILOGRAM': return 'Kilogram';
      case 'MILLILITER': return 'Milliliter';
      case 'LITER': return 'Liter';
      case 'TEASPOON': return isPlural ? 'Theelepels' : 'Theelepel';
      case 'TABLESPOON': return isPlural ? 'Eetlepels' : 'Eetlepel';
      case 'CUP': return isPlural ? 'Kopjes' : 'Kopje';
      case 'PIECE': return isPlural ? 'Stuks' : 'Stuk';
      default: return unitEnum;
    }
  }
}
