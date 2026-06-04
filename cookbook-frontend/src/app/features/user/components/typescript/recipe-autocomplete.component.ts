import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RecipeService } from '@shared/services/recipe';
import { RecipeSummary } from '@shared/domain/recipe';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap, } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScheduleContext } from '@shared/domain/week-schedule';

export const SKIP_DAY_VALUE = '__SKIP__';

@Component({
  selector: 'app-recipe-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
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
        maxlength="150"
        (input)="onInput($event)"
      />
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayFn"
        (optionSelected)="onOptionSelected($event)"
      >
        @for (recipe of allRecipes(); track recipe.id) {
          <mat-option [value]="recipe">{{ recipe.name }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class RecipeAutocompleteComponent implements AfterViewInit {
  readonly context = input.required<ScheduleContext>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | RecipeSummary | null>>();
  readonly preselectedRecipe = input<RecipeSummary | undefined>(undefined);

  inputControl = new FormControl('', [ Validators.maxLength(150) ]);
  selectedDisplayName = signal<string>('');

  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly autocompleteTrigger = viewChild(MatAutocompleteTrigger);

  readonly allRecipes = signal<RecipeSummary[]>([]);
  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) =>
          this.recipeService.searchRecipesByName(this.context(), query, 0, 10).pipe(
            catchError(() => of([] as RecipeSummary[]))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((results) => {
        this.allRecipes.set(results);

        const trigger = this.autocompleteTrigger();
        if (trigger && results.length > 0) {
          trigger.openPanel();
        }
      });

    effect(() => {
      const recipe = this.preselectedRecipe();
      const ctrl = this.control();
      if (recipe && ctrl) {
        ctrl.setValue(recipe.id, { emitEvent: false });
        this.selectedDisplayName.set(recipe.name);
        this.inputControl.setValue(recipe.name, { emitEvent: false });
      }
    });

    effect(() => {
      const ctrl = this.control();
      if (!ctrl) return;

      ctrl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          if (value === SKIP_DAY_VALUE) {
            this.selectedDisplayName.set('Skip this day');
            this.inputControl.setValue('Skip this day', { emitEvent: false });
            this.inputControl.disable();
          } else if (!value) {
            this.selectedDisplayName.set('');
            this.inputControl.setValue('', { emitEvent: false });
            this.inputControl.enable();
          }
        });
    });
  }

  onInput(event: Event): void {
    if (this.inputControl.disabled) return;

    const inputValue = (event.target as HTMLInputElement).value;
    if (this.control().value === SKIP_DAY_VALUE) {
      this.control().setValue('');
      this.selectedDisplayName.set('');
      this.inputControl.enable();
    }
    this.searchSubject.next(inputValue);
  }

  displayFn = (
    value: { id: string; name: string } | RecipeSummary | string | null
  ): string => {
    if (!value) return '';
    if (typeof value === 'object' && 'name' in value) {
      return value.name;
    }
    return this.selectedDisplayName() || '';
  };

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selected = event.option.value as RecipeSummary;
    if (!selected) return;
    this.control().setValue(selected.id);
    this.selectedDisplayName.set(selected.name);
    this.inputControl.setValue(selected.name, { emitEvent: false });
  }

  ngAfterViewInit(): void {
    const ctrl = this.control();
    if (!ctrl) return;

    const initialValue = ctrl.value;
    if (initialValue === SKIP_DAY_VALUE) {
      this.selectedDisplayName.set('Skip this day');
      this.inputControl.setValue('Skip this day', { emitEvent: false });
      this.inputControl.disable();
    } else if (initialValue && typeof initialValue !== 'string') {
      this.selectedDisplayName.set(initialValue.name);
      this.inputControl.setValue(initialValue.name, { emitEvent: false });
    }
  }
}
