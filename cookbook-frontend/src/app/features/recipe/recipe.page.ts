import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RecipeCreateModalComponent } from './components/typescript/recipe-create-modal.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { RecipeListComponent } from './components/typescript/recipe-list.component';
import { RecipeService } from '@shared/services/recipe';
import { RecipeFilterComponent } from '@features/recipe/components/typescript/recipe-filter.component';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-recipe-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeCreateModalComponent, ToastComponent, RecipeListComponent, RecipeFilterComponent],
  templateUrl: './recipe.page.html',
  styleUrl: './recipe.page.scss'
})
export default class RecipePage {
  private readonly recipeService = inject(RecipeService);

  readonly isCreateModalOpen = signal(false);
  readonly pageSize = signal(20);
  readonly pageIndex = signal(0);
  readonly selectedIngredientIds = signal<string[]>([]);

  readonly recipeResource = rxResource({
    params: () => ({
      page: this.pageIndex(),
      size: this.pageSize(),
      ingredients: this.selectedIngredientIds()
    }),
    stream: ({ params }) => this.recipeService.getRecipes(
      params.page,
      params.size,
      params.ingredients
    )
  });

  readonly recipes = computed(() => this.recipeResource.value()?.content ?? []);
  readonly totalPages = computed(() => this.recipeResource.value()?.page.totalPages ?? 0);
  readonly isLoading = this.recipeResource.isLoading;

  onFilterChange(ingredientIds: string[]): void {
    this.selectedIngredientIds.set(ingredientIds);
    this.pageIndex.set(0);
  }

  onPageChange(newPageIndex: number): void {
    this.pageIndex.set(newPageIndex);
  }

  onRecipeCreated(): void {
    this.recipeResource.reload();
  }

  openModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeModal(): void {
    this.isCreateModalOpen.set(false);
  }
}
