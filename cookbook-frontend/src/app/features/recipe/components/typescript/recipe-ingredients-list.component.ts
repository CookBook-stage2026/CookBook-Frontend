import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatList, MatListItem, MatListItemTitle, MatListItemMeta } from '@angular/material/list';
import { RecipeIngredientDto } from '@shared/domain/recipe';
import { formatUnitAbbreviation } from '@shared/domain/ingredient';

@Component({
  selector: 'app-recipe-ingredients-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatList, MatListItem, MatListItemTitle, MatListItemMeta],
  styles: `
    .ingredient-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 4rem;
    }

    @media (max-width: 600px) {
      .ingredient-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  template: `
    <h2>Ingredients</h2>
    <mat-list class="ingredient-grid" aria-label="Ingredients">
      @for (item of ingredients(); track item.ingredientId) {
        <mat-list-item>
          <span matListItemTitle>{{ item.name }}</span>
          <span matListItemMeta>{{ formatQuantity(item) }}</span>
        </mat-list-item>
      }
    </mat-list>
  `
})
export class RecipeIngredientsComponent {
  ingredients = input.required<RecipeIngredientDto[]>();

  formatQuantity(item: RecipeIngredientDto): string {
    const { baseQuantity, unit } = item;

    if (!unit) return '';

    return `${baseQuantity} ${formatUnitAbbreviation(unit)}`;
  }
}
