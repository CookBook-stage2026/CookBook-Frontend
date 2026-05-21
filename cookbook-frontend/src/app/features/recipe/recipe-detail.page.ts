import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RecipeService } from '@shared/services/recipe';
import { RecipeDto } from '@shared/domain/recipe';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { RecipeIngredientsComponent } from '@features/recipe/components/typescript/recipe-ingredients-list.component';
import { RecipePreparationComponent } from '@features/recipe/components/typescript/recipe-preparation-list';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { ToastService } from '@core/services';
import { RecipeEnhanceModalComponent } from '@features/recipe/components/typescript/recipe-enhance-modal.component';
import { of } from 'rxjs';
import { RecipeCookingModeComponent } from '@features/recipe/components/typescript/recipe-cooking-mode.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { RecipeEditModalComponent } from '@features/recipe/components/typescript/recipe-edit-modal.component';

@Component({
  selector: 'app-recipe-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipe-detail.page.html',
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
    ToastComponent
  ],
  styleUrls: ['./recipe-detail.page.scss']
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
  readonly isSubmittingEdit = signal(false);

  readonly enhanceRequest = signal<string | undefined>(undefined);

  readonly recipe = rxResource<RecipeDto, string | undefined>({
    params: () => this.recipeId(),
    stream: ({ params }) => this.recipeService.getRecipeById(params)
  });

  openEditModal(recipe: RecipeDto): void {
    const dialogRef = this.dialog.open(RecipeEditModalComponent, {
      data: recipe,
      width: '800px',
      maxWidth: '90vw',
      autoFocus: 'dialog'
    });

    dialogRef.afterClosed().subscribe((didUpdate: boolean) => {
      if (didUpdate) {
        this.recipe.reload();
      }
    });
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
}
