import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, of, Subject, switchMap } from 'rxjs';
import { IngredientService } from '@shared/services/ingredient';
import { formatUnit, Ingredient } from '@shared/domain/ingredient';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IngredientCreateModalComponent
} from '@features/recipe/components/typescript/ingredient-create-modal.component';

@Component({
  selector: 'app-recipe-ingredients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatAutocompleteModule, IngredientCreateModalComponent],
  templateUrl: '../html/recipe-ingredients-form.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeIngredientsFormComponent {
  private readonly ingredientService = inject(IngredientService);

  readonly ingredients = input.required<FormArray<FormGroup>>();
  readonly isSubmitting = input.required<boolean>();
  readonly addIngredient = output<void>();
  readonly removeIngredient = output<number>();

  readonly allIngredients = signal<Ingredient[]>([]);
  readonly isCreateModalOpen = signal(false);

  readonly pendingRowIndex = signal<number | null>(null);
  readonly currentSearchTerm = signal<string>('');

  readonly createButtonText = computed<string>(() => {
    const query = this.currentSearchTerm().trim();
    return query ? `Create "${query}"` : 'Create New Ingredient';
  });

  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(100),
      switchMap(query => {
        if (!query.trim()) return of([]);
        return this.ingredientService.searchIngredients(query);
      }),
      takeUntilDestroyed()
    ).subscribe(results => {
      const selectedIds = new Set(
        this.ingredients().controls
          .map(ctrl => ctrl.get('id')?.value)
          .filter(id => id !== null)
      );

      this.allIngredients.set(results.filter(ing => !selectedIds.has(ing.id)));
    });
  }

  add(): void {
    this.allIngredients.set([]);
    this.addIngredient.emit();
  }

  remove(index: number): void {
    this.removeIngredient.emit(index);
  }

  openCreateModal(index: number | null = null): void {
    if (index === null) {
      const controls = this.ingredients().controls;

      const matchingIndex = controls.findIndex(
        ctrl =>
          !ctrl.get('id')?.value &&
          ctrl.get('name')?.value?.trim().toLowerCase() ===
          this.currentSearchTerm().trim().toLowerCase()
      );

      this.pendingRowIndex.set(matchingIndex === -1 ? null : matchingIndex);
    } else {
      this.pendingRowIndex.set(index);
    }

    this.isCreateModalOpen.set(true);
  }

  onIngredientCreated(ingredient: Ingredient): void {
    const targetIndex = this.pendingRowIndex();

    if (targetIndex !== null && targetIndex >= 0) {
      this.removeIngredient.emit(targetIndex);
    }

    this.addIngredient.emit();

    const arrayLength = this.ingredients().length;
    const freshCtrl = this.ingredients().at(arrayLength - 1);

    freshCtrl.patchValue({
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit
    });

    this.allIngredients.update(existing => {
      const alreadyExists = existing.some(i => i.id === ingredient.id);
      return alreadyExists ? existing : [...existing, ingredient];
    });

    this.currentSearchTerm.set('');
    this.pendingRowIndex.set(null);
    this.isCreateModalOpen.set(false);
  }

  onNameChange(event: Event, ctrl: AbstractControl): void {
    const inputName = (event.target as HTMLInputElement).value;
    this.currentSearchTerm.set(inputName);
    this.searchSubject.next(inputName);

    const matched = this.allIngredients().find(
      i => i.name.toLowerCase() === inputName.trim().toLowerCase()
    );

    if (matched) {
      ctrl.patchValue({ id: matched.id, unit: matched.unit ?? '' });
    } else {
      ctrl.patchValue({ id: null, unit: '' });
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent, ctrl: AbstractControl): void {
    const selectedName = event.option.value;
    this.currentSearchTerm.set(selectedName);

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

    return formatUnit(unitEnum, quantity);
  }
}
