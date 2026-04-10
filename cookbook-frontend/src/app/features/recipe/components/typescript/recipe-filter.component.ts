import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of } from 'rxjs';
import { IngredientService } from '@shared/services/ingredient';
import { Ingredient } from '@shared/domain/ingredient';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  output,
  signal,
  viewChild
} from '@angular/core';

@Component({
  selector: 'app-recipe-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: '../html/recipe-filter.component.html',
  styleUrl: '../scss/recipe-filter.component.scss'
})
export class RecipeFilterComponent {
  private readonly ingredientService = inject(IngredientService);

  readonly selectedIngredientsChange = output<string[]>();
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly selectedIngredients = signal<Ingredient[]>([]);
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private readonly debouncedQuery = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  readonly ingredientResource = rxResource({
    params: () => ({ query: this.debouncedQuery() }),
    stream: ({ params }) => {
      if (params.query.length < 1) return of([]);
      return this.ingredientService.getIngredients(params.query);
    }
  });

  readonly filteredResults = computed(() => {
    const results = this.ingredientResource.value() ?? [];
    const selectedIds = new Set(this.selectedIngredients().map(i => i.id));
    return results.filter(ing => !selectedIds.has(ing.id));
  });

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const ingredient = event.option.value as Ingredient;

    this.selectedIngredients.update(list => [...list, ingredient]);
    this.emitChanges();

    this.searchControl.setValue('');
    this.searchInput()?.nativeElement.blur();
  }

  removeIngredient(ingredient: Ingredient): void {
    this.selectedIngredients.update(list =>
      list.filter(i => i.id !== ingredient.id)
    );
    this.emitChanges();
  }

  private emitChanges(): void {
    const ids = this.selectedIngredients()
      .map(i => i.id)
      .filter((id): id is string => !!id);
    this.selectedIngredientsChange.emit(ids);
  }
}
