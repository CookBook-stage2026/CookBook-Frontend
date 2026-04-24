import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, viewChild, model } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of } from 'rxjs';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { IngredientService } from '@shared/services/ingredient';
import { Ingredient } from '@shared/domain/ingredient';

@Component({
  selector: 'app-exclude-ingredients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatChipsModule, MatIconModule],
  templateUrl: '../html/exclude-ingredients.component.html',
  styleUrl: '../scss/exclude-ingredients.component.scss'
})
export class ExcludeIngredientsComponent {
  private readonly ingredientService = inject(IngredientService);

  readonly excludedIngredients = model.required<Ingredient[]>();

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private readonly debouncedQuery = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' }
  );

  readonly ingredientResource = rxResource({
    params: () => ({ query: this.debouncedQuery() }),
    stream: ({ params }) => {
      if (params.query.length < 1) return of([]);
      return this.ingredientService.searchIngredients(params.query);
    }
  });

  readonly filteredResults = computed(() => {
    const results = this.ingredientResource.value() ?? [];
    const excludedIds = new Set(this.excludedIngredients().map(i => i.id));
    return results.filter(ing => !excludedIds.has(ing.id));
  });

  onIngredientSelected(event: MatAutocompleteSelectedEvent): void {
    const ingredient = event.option.value as Ingredient;
    this.excludedIngredients.update(list => [...list, ingredient]);
    this.searchControl.setValue('');
    this.searchInput()?.nativeElement.blur();
  }

  removeIngredient(ingredient: Ingredient): void {
    this.excludedIngredients.update(list => list.filter(i => i.id !== ingredient.id));
  }
}
