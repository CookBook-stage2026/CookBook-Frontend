import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { IngredientService } from '@shared/services/ingredient';
import { formatCategoryLabel } from '@shared/domain/ingredient';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-exclude-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: '../html/exclude-categories.component.html',
  styleUrl: '../scss/exclude-categories.component.scss'
})
export class ExcludeCategoriesComponent {
  private readonly ingredientService = inject(IngredientService);

  readonly excludedCategories = model.required<string[]>();

  readonly categories = toSignal(
    this.ingredientService.getCategories(),
    { initialValue: [] }
  );

  toggleCategory(category: string): void {
    this.excludedCategories.update(current =>
      current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category]
    );
  }

  isCategoryExcluded(category: string): boolean {
    return this.excludedCategories().includes(category);
  }

  protected readonly formatCategoryLabel = formatCategoryLabel;
}
