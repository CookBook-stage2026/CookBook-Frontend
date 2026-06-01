import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { rxResource } from '@angular/core/rxjs-interop';
import { RecipeService } from '@shared/services/recipe';
import { RecipeDto } from '@shared/domain/recipe';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { RecipeListComponent } from '@features/recipe/components/typescript/recipe-list.component';
import { RecipeFilterComponent } from '@features/recipe/components/typescript/recipe-filter.component';
import { RecipeImportDialogComponent } from '@features/recipe/components/typescript/recipe-import-dialog.component';
import { RecipeFormModalComponent } from '@features/recipe/components/typescript/recipe-form-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { EnumHelper } from '@shared/utils/enum-helper.service';

@Component({
  selector: 'app-recipe-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ToastComponent,
    RecipeListComponent,
    RecipeFilterComponent,
    MatButton,
    MatIcon,
    RecipeFormModalComponent,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './recipe.page.html',
  styleUrl: './recipe.page.scss',
})
export default class RecipePage {
  private readonly recipeService = inject(RecipeService);
  private readonly enumHelper = inject(EnumHelper);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly isCreateModalOpen = signal(false);
  readonly pageSize = signal(20);
  readonly pageIndex = signal(0);
  readonly selectedIngredientIds = signal<string[]>([]);
  readonly shouldApplyPreferences = signal(true);
  readonly includeAccessibleRecipes = signal(true);

  readonly sortBy = signal<string>('NAME');
  readonly sortDirection = signal<string>('ASCENDING');

  readonly initialSortBy = this.enumHelper.formatEnum('NAME');

  readonly recipeResource = rxResource({
    params: () => ({
      page: this.pageIndex(),
      size: this.pageSize(),
      ingredients: this.selectedIngredientIds(),
      applyPrefs: this.shouldApplyPreferences(),
      includeAccessible: this.includeAccessibleRecipes(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection()
    }),
    stream: ({ params }) => this.recipeService.searchRecipesByFilter(
      params.ingredients,
      params.applyPrefs,
      params.includeAccessible,
      params.page,
      params.size,
      params.sortBy,
      params.sortDirection
    )
  });

  readonly recipes = computed(() => this.recipeResource.value()?.content ?? []);
  readonly totalPages = computed(() => this.recipeResource.value()?.page.totalPages ?? 0);
  readonly isLoading = this.recipeResource.isLoading;

  toggleScope(): void {
    this.includeAccessibleRecipes.update(val => !val);
    this.pageIndex.set(0);
  }

  togglePreferences(): void {
    this.shouldApplyPreferences.update(val => !val);
    this.pageIndex.set(0);
  }

  openImportDialog(): void {
    const dialogRef = this.dialog.open(RecipeImportDialogComponent, {
      width: '580px',
      maxWidth: '95vw',
      maxHeight: '88vh',
      autoFocus: 'input',
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((recipe: RecipeDto | null) => {
      this.recipeResource.reload();
      if (recipe) {
        this.router.navigate([ '/recipes', recipe.id ]);
      }
    });
  }

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

  onSortFieldChange(field: string): void {
    this.sortBy.set(field);
    this.pageIndex.set(0);
  }

  toggleSortDirection(): void {
    this.sortDirection.update(dir => dir === 'ASCENDING' ? 'DESCENDING' : 'ASCENDING');
    this.pageIndex.set(0);
  }
}
