import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ToastService } from '@core/services';
import { IngredientService } from '@shared/services/ingredient';
import { Ingredient } from '@shared/domain/ingredient';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';
import { IngredientListComponent } from '@features/ingredient/components/typescript/ingredient-list.component';
import { IngredientModalComponent } from '@shared/components/ingredient/ingredient-modal.component';
import { RecipeService } from '@shared/services/recipe';

@Component({
  selector: 'app-ingredient-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ToastComponent,
    IngredientListComponent,
    IngredientModalComponent
  ],
  templateUrl: './ingredient.page.html',
  styleUrl: './ingredient.page.scss'
})
export default class IngredientPage {
  private readonly ingredientService = inject(IngredientService);
  private readonly recipeService = inject(RecipeService);
  private readonly dialog = inject(MatDialog);
  private readonly toastService = inject(ToastService);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(15);
  readonly mutationTrigger = signal(0);

  readonly searchQuery = signal('');

  readonly isModalOpen = signal(false);
  readonly selectedIngredientForEdit = signal<Ingredient | null>(null);

  readonly ingredientResource = rxResource({
    params: () => ({
      page: this.pageIndex(),
      size: this.pageSize(),
      query: this.searchQuery(),
      mutation: this.mutationTrigger()
    }),
    stream: ({ params }) =>
      this.ingredientService.searchIngredients({
        query: params.query,
        alreadySelectedIds: [],
        page: params.page,
        size: params.size,
        onlyPersonal: true
      })
  });

  readonly ingredients = computed(() => this.ingredientResource.value()?.content ?? []);
  readonly totalPages = computed(() => this.ingredientResource.value()?.page.totalPages ?? 0);
  readonly isLoading = this.ingredientResource.isLoading;

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.pageIndex.set(0);
  }

  clearSearch(searchInput: HTMLInputElement): void {
    searchInput.value = '';
    this.searchQuery.set('');
    this.pageIndex.set(0);
  }

  onPageChange(newIndex: number): void {
    this.pageIndex.set(newIndex);
  }

  openModal(ingredient: Ingredient | null = null): void {
    this.selectedIngredientForEdit.set(ingredient);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedIngredientForEdit.set(null);
  }

  onIngredientSaved(saved: Ingredient): void {
    const wasEdit = this.selectedIngredientForEdit() !== null;
    this.toastService.show(
      wasEdit
        ? `Ingredient "${saved.name}" updated successfully.`
        : `Ingredient "${saved.name}" added successfully.`,
      'success'
    );
    this.refreshData();
  }

  onDeleteRequest(ingredient: Ingredient): void {
    this.recipeService.searchRecipesByFilter([ ingredient.id ], false, false, 0, 3, "", "").subscribe({
      next: (response) => {
        let message = `Are you sure you want to delete "${ingredient.name}"? This action cannot be undone.`;

        if (response.content.length > 0) {
          const names = response.content.map(recipe => recipe.name).join(', ');
          const remaining = response.page.totalElements - response.content.length;
          const formattedRecipes = remaining > 0 ? `${names}, and ${remaining} others` : names;

          message = `Are you sure you want to delete ${ingredient.name}? \n\nIt is currently used in the following recipes: ${formattedRecipes}. \n\nDeleting this ingredient may render those recipes incomplete or inaccurate and cannot be undone.`;
        }

        const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
          data: { message }
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.ingredientService.deleteIngredient(ingredient.id).subscribe({
              next: () => {
                this.toastService.show('Ingredient deleted successfully.', 'success');
                this.refreshData();
              },
              error: () => {
                this.toastService.show('Failed to delete ingredient.', 'error');
              }
            });
          }
        });
      },
      error: () => {
        this.toastService.show('Failed to verify linked recipes. Please try again.', 'error');
      }
    });
  }

  private refreshData(): void {
    this.mutationTrigger.update(n => n + 1);
  }
}
