import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RecipeCreateModalComponent } from './components/typescript/recipe-create-modal.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { RecipeListComponent } from './components/typescript/recipe-list.component';
import { RecipeService } from '@shared/services/recipe';
import { RecipeFilterComponent } from '@features/recipe/components/typescript/recipe-filter.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RecipeCreateModalComponent,
    ToastComponent,
    RecipeListComponent,
    RecipeFilterComponent,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatProgressSpinner,
    ReactiveFormsModule
  ],
  templateUrl: './recipe.page.html',
  styleUrl: './recipe.page.scss'
})
export default class RecipePage {
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);

  readonly isCreateModalOpen = signal(false);
  readonly isImporting = signal(false);
  readonly showImportForm = signal(false);
  readonly pageSize = signal(20);
  readonly pageIndex = signal(0);
  readonly selectedIngredientIds = signal<string[]>([]);
  readonly shouldApplyPreferences = signal(true);

  readonly importForm = new FormGroup({
    url: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/)
      ]
    })
  });

  readonly recipeResource = rxResource({
    params: () => ({
      page: this.pageIndex(),
      size: this.pageSize(),
      ingredients: this.selectedIngredientIds(),
      applyPrefs: this.shouldApplyPreferences()
    }),
    stream: ({ params }) => this.recipeService.searchRecipesByFilter(
      params.ingredients,
      params.applyPrefs,
      params.page,
      params.size
    )
  });

  readonly recipes = computed(() => this.recipeResource.value()?.content ?? []);
  readonly totalPages = computed(() => this.recipeResource.value()?.page.totalPages ?? 0);
  readonly isLoading = this.recipeResource.isLoading;

  togglePreferences(): void {
    this.shouldApplyPreferences.update(val => !val);
    this.pageIndex.set(0);
  }

  toggleImportForm(): void {
    this.showImportForm.update(value => !value);
    if (!this.showImportForm()) {
      this.importForm.reset();
    }
  }

  importRecipe(): void {
    if (this.importForm.invalid) return;

    const url = this.importForm.controls.url.value.trim();
    this.isImporting.set(true);

    this.recipeService.importRecipe(url).subscribe({
      next: (recipe) => {
        this.isImporting.set(false);
        this.showImportForm.set(false);
        this.importForm.reset();
        this.router.navigate([ '/recipes', recipe.id ]);
      },
      error: () => {
        this.isImporting.set(false);
      }
    });
  }

  getUrlErrorMessage(): string {
    const control = this.importForm.controls.url;
    if (control.hasError('required')) {
      return 'URL is required';
    }
    if (control.hasError('pattern')) {
      return 'Please enter a valid URL starting with http:// or https://';
    }
    return '';
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
}
