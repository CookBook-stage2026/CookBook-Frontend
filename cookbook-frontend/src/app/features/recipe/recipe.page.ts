import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RecipeCreateModalComponent } from './components/typescript/recipe-create-modal.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { RecipeListComponent } from './components/typescript/recipe-list.component';
import { RecipeSummary } from '@shared/domain/recipe';
import {RecipeService} from '@shared/services/recipe';

@Component({
  selector: 'app-recipe-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeCreateModalComponent, ToastComponent, RecipeListComponent],
  templateUrl: './recipe.page.html',
  styleUrl: './recipe.page.scss'
})
export default class RecipePage implements OnInit {
  private readonly recipeService = inject(RecipeService);

  isCreateModalOpen = signal(false);
  recipes = signal<RecipeSummary[]>([]);
  pageSize = signal(20);
  pageIndex = signal(0);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.isLoading.set(true);
    this.recipeService.getRecipes(this.pageIndex(), this.pageSize()).subscribe({
      next: (data) => {
        this.recipes.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onRecipeCreated(): void {
    this.loadRecipes();
  }

  onPageChange(newPageIndex: number): void {
    this.pageIndex.set(newPageIndex);
    this.loadRecipes();
  }
}
