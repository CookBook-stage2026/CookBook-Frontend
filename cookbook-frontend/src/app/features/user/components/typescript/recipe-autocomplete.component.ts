import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {RecipeService} from '@shared/services/recipe';
import {RecipeSummary} from '@shared/domain/recipe';
import {debounceTime, distinctUntilChanged, switchMap, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export const SKIP_DAY_VALUE = '__SKIP__';

@Component({
  selector: 'app-recipe-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width" floatLabel="always">
      <mat-label>{{ label() }}</mat-label>
      <input
        type="text"
        matInput
        [formControl]="inputControl"
        [matAutocomplete]="auto"
        placeholder="Search recipes..."
        autocomplete="off"
        (input)="onInput($event)"
      />
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayFn"
        (optionSelected)="onOptionSelected($event)"
      >
        <mat-option [value]="{ id: '__SKIP__', name: 'Skip this day' }">
          Skip this day
        </mat-option>
        @for (recipe of allRecipes(); track recipe.id) {
          <mat-option [value]="recipe">{{ recipe.name }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class RecipeAutocompleteComponent {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | null>>();

  inputControl = new FormControl('');
  selectedDisplayName = signal<string>('');

  private readonly recipeService = inject(RecipeService);

  readonly allRecipes = signal<RecipeSummary[]>([]);
  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.recipeService.searchRecipes(query, 0, 10)),
      takeUntilDestroyed()
    ).subscribe(results => {
      this.allRecipes.set(results);
    });
  }

  onInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(inputValue);
  }

  displayFn = (value: { id: string; name: string } | RecipeSummary | string | null): string => {
    if (!value) return '';
    if (typeof value === 'object' && 'name' in value) {
      return value.name;
    }
    return this.selectedDisplayName() || '';
  };

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selected = event.option.value;

    if (!selected) return;

    if (selected.id === SKIP_DAY_VALUE) {
      this.control().setValue(SKIP_DAY_VALUE);
      this.selectedDisplayName.set('Skip this day');
      this.inputControl.setValue('Skip this day', {emitEvent: false});
    } else {
      this.control().setValue(selected.id);
      this.selectedDisplayName.set(selected.name);
      this.inputControl.setValue(selected.name, {emitEvent: false});
    }
  }
}
