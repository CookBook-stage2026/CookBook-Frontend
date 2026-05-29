import { ChangeDetectionStrategy, Component, computed, input, OnInit, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RecipeDto } from '@shared/domain/recipe';

@Component({
  selector: 'app-recipe-servings-adjuster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconButton,
    MatIcon,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: '../html/recipe-servings-adjuster.component.html',
  styleUrls: [ '../scss/recipe-servings-adjuster.component.scss' ]
})
export class RecipeServingsAdjusterComponent implements OnInit {
  readonly recipe = input.required<RecipeDto>();
  readonly currentAdjustedServings = input<number | undefined>(undefined);

  readonly servingsChanged = output<number>();

  readonly localServings = signal<number | null>(1);

  private readonly MIN_SERVINGS = 1;
  private readonly MAX_SERVINGS = 1000;

  readonly canDecrease = computed(() => {
    const current = this.localServings();
    return current !== null && current > this.MIN_SERVINGS;
  });

  readonly canIncrease = computed(() => {
    const current = this.localServings();
    return current !== null && current < this.MAX_SERVINGS;
  });

  readonly hasPendingChanges = computed(() => {
    const activeValue = this.currentAdjustedServings() ?? this.recipe().servings;
    const current = this.localServings();
    return current !== null && current !== activeValue;
  });

  ngOnInit(): void {
    const initialValue = this.currentAdjustedServings() ?? this.recipe().servings;
    this.localServings.set(initialValue);
  }

  decrement(): void {
    if (this.canDecrease()) {
      this.localServings.update(s => (s == null ? this.MIN_SERVINGS : s - 1));
    }
  }

  increment(): void {
    if (this.canIncrease()) {
      this.localServings.update(s => (s == null ? this.MIN_SERVINGS : s + 1));
    }
  }

  handleInputChange(inputElement: HTMLInputElement): void {
    const rawValue = inputElement.value;

    if (!rawValue) {
      this.localServings.set(null);
      return;
    }

    let parsed = Number.parseInt(rawValue, 10);

    if (!Number.isNaN(parsed)) {
      if (parsed > this.MAX_SERVINGS) {
        parsed = this.MAX_SERVINGS;
        inputElement.value = String(this.MAX_SERVINGS);
      } else if (parsed < this.MIN_SERVINGS && rawValue !== '-') {
        parsed = this.MIN_SERVINGS;
        inputElement.value = String(this.MIN_SERVINGS);
      }
      this.localServings.set(parsed);
    }
  }

  sanitizeOnBlur(inputElement: HTMLInputElement): void {
    const rawValue = inputElement.value;
    const parsed = Number.parseInt(rawValue, 10);

    if (rawValue && !Number.isNaN(parsed) && parsed >= this.MIN_SERVINGS) {
      if (parsed > this.MAX_SERVINGS) {
        this.localServings.set(this.MAX_SERVINGS);
        inputElement.value = String(this.MAX_SERVINGS);
      } else {
        this.localServings.set(parsed);
        inputElement.value = String(parsed);
      }
      return;
    }

    const fallback = this.currentAdjustedServings() ?? this.recipe().servings;
    this.localServings.set(fallback);
    inputElement.value = String(fallback);
  }

  applyNewServings(): void {
    const current = this.localServings();
    if (current !== null && current >= this.MIN_SERVINGS && current <= this.MAX_SERVINGS) {
      this.servingsChanged.emit(current);
    }
  }
}
