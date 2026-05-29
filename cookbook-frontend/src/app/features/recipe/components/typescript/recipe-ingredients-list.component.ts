import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatList, MatListItem, MatListItemMeta, MatListItemTitle } from '@angular/material/list';
import { RecipeIngredientDto } from '@shared/domain/recipe';
import { formatUnitAbbreviation } from '@shared/domain/ingredient';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-recipe-ingredients-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatList, MatListItem, MatListItemTitle, MatListItemMeta, MatIcon],
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

    .empty-ingredients-notice {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border: 1px solid var(--danger-border);
      border-radius: var(--radius-md, 8px);
      color: var(--danger-text);
      margin: 1rem 0;

      mat-icon {
        color: var(--danger-text);
        flex-shrink: 0;
      }

      p {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.5;
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
      } @empty {
        <div class="empty-ingredients-notice" role="alert">
          <mat-icon>info</mat-icon>
          <p>This recipe currently has no ingredients listed. This can happen if previously assigned ingredients were modified or removed.</p>
        </div>
      }
    </mat-list>
  `
})
export class RecipeIngredientsComponent {
  ingredients = input.required<RecipeIngredientDto[]>();

  formatQuantity(item: RecipeIngredientDto): string {
    const { quantity, unit } = item;

    if (!unit) return '';

    return `${quantity} ${formatUnitAbbreviation(unit)}`;
  }
}
