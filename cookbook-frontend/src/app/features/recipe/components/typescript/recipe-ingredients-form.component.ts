import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter, fromEvent, map, of, Subject, switchMap } from 'rxjs';
import { IngredientService } from '@shared/services/ingredient';
import { formatUnit, Ingredient } from '@shared/domain/ingredient';
import {
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Overlay } from '@angular/cdk/overlay';
import { IngredientModalComponent } from '@shared/components/ingredient/ingredient-modal.component';

@Component({
  selector: 'app-recipe-ingredients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatAutocompleteModule, CdkScrollable, IngredientModalComponent],
  templateUrl: '../html/recipe-ingredients-form.component.html',
  styleUrl: '../scss/recipe-form-modal.component.scss',
  providers: [
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.reposition({ autoClose: true }),
      deps: [ Overlay ]
    }
  ]
})
export class RecipeIngredientsFormComponent {
  private readonly ingredientService = inject(IngredientService);

  readonly ingredients = input.required<FormArray<FormGroup>>();
  readonly isSubmitting = input.required<boolean>();
  readonly addIngredient = output<void>();
  readonly removeIngredient = output<number>();

  readonly isCreateModalOpen = signal(false);
  readonly pendingRowIndex = signal<number | null>(null);
  readonly currentSearchTerm = signal<string>('');

  readonly ingredientsByRow = signal<Map<number, Ingredient[]>>(new Map());

  readonly unitsResource = rxResource({
    stream: () => this.ingredientService.getUnits()
  });

  private readonly _tick = signal(0);

  readonly hasUnselectedRow = computed(() => {
    this._tick();
    return this.ingredients().controls.some(ctrl => !ctrl.get('id')?.value);
  });

  readonly createButtonText = computed<string>(() => {
    const query = this.currentSearchTerm().trim();
    return query ? `Create "${query}"` : 'Create New Ingredient';
  });

  private readonly searchSubject = new Subject<{ query: string; rowIndex: number }>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(100),
      switchMap(({ query, rowIndex }) => {
        if (!query.trim()) return of({ results: [] as Ingredient[], rowIndex });

        return this.ingredientService.searchIngredients({
          query: query,
          alreadySelectedIds: [],
          page: 0,
          size: 10,
          onlyPersonal: false
        }).pipe(
          map(response => ({
            results: response.content,
            rowIndex
          }))
        );
      }),
      takeUntilDestroyed()
    ).subscribe(({ results, rowIndex }) => {
      const selectedIds = new Set(
        this.ingredients().controls
          .map(ctrl => ctrl.get('id')?.value)
          .filter(id => id !== null)
      );

      this.ingredientsByRow.update(current =>
        new Map(current).set(rowIndex, results.filter(ing => !selectedIds.has(ing.id)))
      );
    });

    fromEvent(document, 'click').pipe(
      filter(() => this.ingredientsByRow().size > 0),
      filter(event => {
        const target = event.target as HTMLElement;
        return !target.closest('.ingredient-row') &&
          !target.closest('.mat-mdc-autocomplete-panel');
      }),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.clearAllRowResults();
      this.bump();
    });
  }

  private bump(): void {
    this._tick.update(n => n + 1);
  }

  private clearAllRowResults(): void {
    this.ingredientsByRow.set(new Map());
  }

  add(): void {
    this.clearAllRowResults();
    this.currentSearchTerm.set('');
    this.addIngredient.emit();
    this.bump();
  }

  remove(index: number): void {
    this.clearAllRowResults();
    this.removeIngredient.emit(index);
    this.bump();
  }

  openCreateModal(index: number | null = null): void {
    this.clearAllRowResults();

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
      unit: ingredient.defaultUnit
    });

    this.clearAllRowResults();
    this.currentSearchTerm.set('');
    this.pendingRowIndex.set(null);
    this.isCreateModalOpen.set(false);
    this.bump();
  }

  onNameChange(event: Event, ctrl: AbstractControl, rowIndex: number): void {
    const inputName = (event.target as HTMLInputElement).value;
    this.currentSearchTerm.set(inputName);

    this.ingredientsByRow.update(current => {
      const next = new Map();
      if (current.has(rowIndex)) {
        next.set(rowIndex, current.get(rowIndex));
      }
      return next;
    });

    this.searchSubject.next({ query: inputName, rowIndex });

    const rowResults = this.ingredientsByRow().get(rowIndex) ?? [];
    const matched = rowResults.find(
      i => i.name.toLowerCase() === inputName.trim().toLowerCase()
    );

    if (matched) {
      ctrl.patchValue({ id: matched.id, unit: matched.defaultUnit ?? '' });
    } else {
      ctrl.patchValue({ id: null, unit: '' });
    }
    this.bump();
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent, ctrl: AbstractControl, rowIndex: number): void {
    const selectedName = event.option.value;
    this.currentSearchTerm.set(selectedName);

    const rowResults = this.ingredientsByRow().get(rowIndex) ?? [];
    const matched = rowResults.find(i => i.name === selectedName);
    if (matched) {
      ctrl.patchValue({ id: matched.id, unit: matched.defaultUnit ?? '' });
    }

    this.ingredientsByRow.update(current => {
      const next = new Map(current);
      next.delete(rowIndex);
      return next;
    });

    this.bump();
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

  displayUnitLabel(unitCode: string, count: number): string {
    return formatUnit(unitCode, count);
  }
}
