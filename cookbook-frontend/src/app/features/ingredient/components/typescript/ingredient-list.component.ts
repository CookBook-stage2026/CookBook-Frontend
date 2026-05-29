import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { formatCategoryLabel, formatUnit, Ingredient } from '@shared/domain/ingredient';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ingredient-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: '../html/ingredient-list.component.html',
  styleUrl: '../scss/ingredient-list.component.scss'
})
export class IngredientListComponent {
  readonly ingredients = input.required<Ingredient[]>();
  readonly pageIndex = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly isLoading = input.required<boolean>();

  readonly edit = output<Ingredient>();
  readonly delete = output<Ingredient>();
  readonly pageChange = output<number>();

  labelUnit(unit?: string): string {
    if (!unit) return '';
    return formatUnit(unit);
  }

  labelCategory(cat: string): string {
    return formatCategoryLabel(cat);
  }
}
