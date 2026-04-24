import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { Categories, Category } from '@shared/domain/ingredient';

@Component({
  selector: 'app-exclude-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="category-fieldset">
      <legend><h2>Exclude Ingredient Categories</h2></legend>
      <p>Select entire categories of ingredients to exclude globally.</p>

      <div class="category-grid">
        @for (key of categoryKeys; track key) {
          <label class="category-checkbox">
            <input
              type="checkbox"
              [checked]="isCategoryExcluded(key)"
              (change)="toggleCategory(key)"
            />
            <span class="category-name">{{ categoryDictionary[key] }}</span>
          </label>
        }
      </div>
    </fieldset>
  `,
  styles: `
    h2 { margin-bottom: 8px; }
    p { color: var(--text-secondary); margin-bottom: 16px; }

    .category-fieldset { border: none; padding: 0; margin: 0; }
    .category-fieldset legend { padding: 0; width: 100%; }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px; margin-top: 16px;
    }

    .category-checkbox {
      display: flex; align-items: center; gap: 12px; cursor: pointer;
      padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;
      transition: background-color 0.2s ease;

      &:hover { background-color: var(--hover-color); }
      input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
      .category-name { text-transform: capitalize; }
    }
  `
})
export class ExcludeCategoriesComponent {
  readonly excludedCategories = model.required<Category[]>();

  readonly categoryKeys = Object.keys(Categories) as Category[];
  readonly categoryDictionary = Categories;

  toggleCategory(category: Category): void {
    this.excludedCategories.update(current =>
      current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category]
    );
  }

  isCategoryExcluded(category: Category): boolean {
    return this.excludedCategories().includes(category);
  }
}
