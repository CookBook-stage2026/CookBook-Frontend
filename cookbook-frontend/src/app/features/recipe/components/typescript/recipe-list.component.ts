import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import { RecipeSummary } from '@shared/domain/recipe';
import { RecipeCardComponent } from './recipe-card.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeCardComponent, MatButtonModule],
  templateUrl: '../html/recipe-list.component.html',
  styleUrl: '../scss/recipe-list.component.scss'
})
export class RecipeListComponent {
  recipes = input.required<RecipeSummary[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();
  totalPages = input.required<number>();
  isLoading = input<boolean>(false);

  pageChange = output<number>();

  isPrevDisabled = computed(() => this.pageIndex() === 0 || this.isLoading());

  isNextDisabled = computed(() => {
    const lastPageIndex = Math.max(0, this.totalPages() - 1);
    return this.pageIndex() >= lastPageIndex || this.totalPages() === 0 || this.isLoading();
  });

  displayPage = computed(() => this.pageIndex() + 1);
  displayTotalPages = computed(() => this.totalPages() || 1);

  onNextPage(): void {
    if (!this.isNextDisabled()) {
      this.pageChange.emit(this.pageIndex() + 1);
    }
  }

  onPrevPage(): void {
    if (!this.isPrevDisabled()) {
      this.pageChange.emit(this.pageIndex() - 1);
    }
  }
}
