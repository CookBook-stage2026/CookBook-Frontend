import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Ingredient } from '@shared/domain/ingredient';

@Component({
  selector: 'app-ingredient-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../html/ingredient-list.component.html',
  styleUrl: '../scss/ingredient-list.component.scss'
})
export class IngredientListComponent {
  readonly ingredients = input.required<Ingredient[]>();
  readonly pageSize = input.required<number>();
  readonly pageIndex = input.required<number>();
  readonly isLoading = input(false);

  readonly pageChange = output<number>();
  readonly sizeChange = output<number>();

  readonly pageSizes = [10, 20, 50, 100];

  onNextPage(): void {
    this.pageChange.emit(this.pageIndex() + 1);
  }

  onPrevPage(): void {
    if (this.pageIndex() > 0) {
      this.pageChange.emit(this.pageIndex() - 1);
    }
  }

  onSizeSelection(event: Event): void {
    this.sizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
