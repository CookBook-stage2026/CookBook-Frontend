import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RecipeSummary } from '@shared/domain/recipe';
import { RecipeCardComponent } from './recipe-card.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeCardComponent],
  templateUrl: '../html/recipe-list.component.html',
  styleUrl: '../scss/recipe-list.component.scss'
})
export class RecipeListComponent {
  recipes = input.required<RecipeSummary[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();
  isLoading = input<boolean>(false);

  pageChange = output<number>();

  onNextPage(): void {
    this.pageChange.emit(this.pageIndex() + 1);
  }

  onPrevPage(): void {
    if (this.pageIndex() > 0) {
      this.pageChange.emit(this.pageIndex() - 1);
    }
  }
}
