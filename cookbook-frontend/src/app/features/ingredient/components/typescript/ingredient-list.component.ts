import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Ingredient } from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../html/ingredient-list.component.html',
  styleUrl: '../scss/ingredient-list.component.scss'
})
export class IngredientListComponent {
  ingredients = input.required<Ingredient[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();
  isLoading = input<boolean>(false);

  pageChange = output<number>();
  sizeChange = output<number>();

  pageSizes = [10, 20, 50, 100];

  onNextPage(): void {
    this.pageChange.emit(this.pageIndex() + 1);
  }

  onPrevPage(): void {
    if (this.pageIndex() > 0) {
      this.pageChange.emit(this.pageIndex() - 1);
    }
  }

  onSizeSelection(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sizeChange.emit(Number(selectElement.value));
  }
}
