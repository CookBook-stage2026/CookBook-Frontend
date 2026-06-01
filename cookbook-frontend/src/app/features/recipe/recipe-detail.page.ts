import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RecipeService } from '@shared/services/recipe';
import { RecipeDto } from '@shared/domain/recipe';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { of } from 'rxjs';
import { ToastService } from '@core/services';

import { RecipeIngredientsComponent } from '@features/recipe/components/typescript/recipe-ingredients-list.component';
import { RecipePreparationComponent } from '@features/recipe/components/typescript/recipe-preparation-list';
import { RecipeCookingModeComponent } from '@features/recipe/components/typescript/recipe-cooking-mode.component';
import { RecipeMacrosComponent } from '@features/recipe/components/typescript/recipe-macros.component';
import { RecipeEnhanceModalComponent } from '@features/recipe/components/typescript/recipe-enhance-modal.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { RecipeFormModalComponent } from '@features/recipe/components/typescript/recipe-form-modal.component';
import {
  RecipeServingsAdjusterComponent
} from '@features/recipe/components/typescript/recipe-servings-adjuster.component';

@Component({
  selector: 'app-recipe-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-detail.page.html',
  styleUrl: './recipe-detail.page.scss',
  imports: [
    MatProgressSpinner,
    MatChipSet,
    MatChip,
    MatIcon,
    MatDivider,
    MatButton,
    RecipeIngredientsComponent,
    RecipePreparationComponent,
    MatButton,
    RecipeCookingModeComponent,
    ToastComponent,
    RecipeMacrosComponent,
    RecipeServingsAdjusterComponent,
    RecipeFormModalComponent
  ]
})
export default class RecipeDetailPage {
  readonly recipeService = inject(RecipeService);
  readonly dialog = inject(MatDialog);
  readonly toastService = inject(ToastService);
  readonly location = inject(Location);
  readonly route = inject(ActivatedRoute);

  readonly recipeId = input.required<string>();

  readonly isCookingMode = signal(false);
  readonly isUpdatingVisibility = signal(false);
  readonly isGeneratingMacros = signal(false);
  readonly isFormModalOpen = signal(false);

  readonly enhanceRequest = signal<string | undefined>(undefined);
  readonly adjustedServings = signal<number | undefined>(undefined);
  readonly isPreviewMode = signal(false);

  readonly recipe = rxResource<RecipeDto, string | undefined>({
    params: () => this.recipeId(),
    stream: ({ params }) => this.recipeService.getRecipeById(params)
  });

  readonly adjustedRecipe = rxResource<RecipeDto | undefined, { id: string; servings: number } | undefined>({
    params: () => {
      const id = this.recipeId();
      const servings = this.adjustedServings();
      if (!id || !servings) return undefined;
      return { id, servings };
    },
    stream: ({ params }) => {
      if (!params) return of(undefined);
      return this.recipeService.getRecipeForServings(params.id, params.servings);
    }
  });

  readonly displayRecipe = computed(() => {
    const adjusted = this.adjustedRecipe.value();
    if (adjusted && this.isPreviewMode()) {
      return adjusted;
    }
    return this.recipe.value();
  });

  readonly isLoading = computed(() =>
    this.recipe.isLoading() || (this.isPreviewMode() && this.adjustedRecipe.isLoading())
  );

  readonly hasError = computed(() =>
    this.recipe.error() || (this.isPreviewMode() && this.adjustedRecipe.error())
  );

  constructor() {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'cooking') {
      this.isCookingMode.set(true);
    }

    effect(() => {
      const isRequestActive = this.enhanceRequest();

      if (!isRequestActive) return;

      const error = this.enhancedRecipe.error();
      if (error) {
        untracked(() => {
          this.toastService.show(error.message, 'error');
          this.enhanceRequest.set(undefined);
        });
        return;
      }

      const recipe = this.enhancedRecipe.value();
      if (recipe) {
        const dialogRef = this.dialog.open(RecipeEnhanceModalComponent, {
          data: recipe,
          width: '800px',
          maxWidth: '90vw',
          autoFocus: 'dialog'
        });

        dialogRef.afterClosed().subscribe((didSave: boolean) => {
          if (didSave) {
            this.recipe.reload();
          }
        });

        untracked(() => this.enhanceRequest.set(undefined));
      }
    });
  }

  openFormModal(): void {
    this.isFormModalOpen.set(true);
  }

  onRecipeSaved(): void {
    this.recipe.reload();
  }

  toggleVisibility(currentPublicStatus: boolean): void {
    const id = this.recipeId();
    if (!id) return;

    const nextStatus = !currentPublicStatus;
    this.isUpdatingVisibility.set(true);

    this.recipeService.changeVisibility(id, nextStatus).subscribe({
      next: () => {
        this.isUpdatingVisibility.set(false);
        this.toastService.show(`Recipe is now ${nextStatus ? 'Public' : 'Private'}.`, 'success');
        this.recipe.reload();
      },
      error: () => {
        this.isUpdatingVisibility.set(false);
        this.toastService.show('Failed to alter recipe visibility configuration.', 'error');
      }
    });
  }

  enterCookingMode(): void {
    this.isCookingMode.set(true);
  }

  exitCookingMode(): void {
    this.isCookingMode.set(false);
    if (this.route.snapshot.queryParamMap.has('mode')) {
      const url = new URL(globalThis.location.href);
      url.searchParams.delete('mode');
      globalThis.history.replaceState({}, '', url);
    }
  }

  onServingsChanged(servings: number): void {
    const currentRecipe = this.recipe.value();
    if (!currentRecipe || servings === currentRecipe.servings) {
      this.isPreviewMode.set(false);
      this.adjustedServings.set(undefined);
      return;
    }

    this.adjustedServings.set(servings);
    this.isPreviewMode.set(true);
  }

  readonly enhancedRecipe = rxResource<RecipeDto | undefined, string | undefined>({
    params: () => this.enhanceRequest(),
    stream: ({ params }) => {
      if (!params) return of(undefined);
      return this.recipeService.enhanceRecipe(params);
    }
  });

  enhanceRecipe(): void {
    const id = this.recipeId();
    if (id) {
      this.enhanceRequest.set(id);
    }
  }

  generateMacros(): void {
    const id = this.recipeId();
    if (!id || this.isGeneratingMacros()) return;

    this.isGeneratingMacros.set(true);

    this.recipeService.calculateMacros(id).subscribe({
      next: () => {
        this.isGeneratingMacros.set(false);
        this.toastService.show('Macronutrients calculated successfully.', 'success');
        this.recipe.reload();
      },
      error: () => {
        this.isGeneratingMacros.set(false);
        this.toastService.show('Failed to calculate nutritional macros. Please verify ingredient mappings.', 'error');
      }
    });
  }
}
