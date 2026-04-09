import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatList, MatListItem, MatListItemTitle, MatListItemMeta } from '@angular/material/list';
import { RecipeIngredientDto } from '@shared/domain/recipe';

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
    if (!unit || unit === 'NONE') return '';

    const labels: Record<string, string> = {
      GRAM: 'g', KILOGRAM: 'kg', MILLILITER: 'ml', LITER: 'L', TEASPOON: 'tsp', TABLESPOON: 'tbsp',
      CUP: baseQuantity === 1 ? 'cup' : 'cups', PIECE: baseQuantity === 1 ? 'piece' : 'pieces', PINCH: 'pinch'
    };

    return `${baseQuantity} ${labels[unit] ?? ''}`;
  }
}
