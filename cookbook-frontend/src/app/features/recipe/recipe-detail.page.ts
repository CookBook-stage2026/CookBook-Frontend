import {ChangeDetectionStrategy, Component, inject, input, signal} from '@angular/core';
import {RecipeService} from '@shared/services/recipe';
import {RecipeDto} from '@shared/domain/recipe';
import {rxResource} from '@angular/core/rxjs-interop';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/list';
import {MatButton} from '@angular/material/button';
import {RecipeIngredientsComponent} from '@features/recipe/components/typescript/recipe-ingredients-list.component';
import {RecipePreparationComponent} from '@features/recipe/components/typescript/recipe-preparation-list';
import {RecipeCookingModeComponent} from '@features/recipe/components/typescript/recipe-cooking-mode.component';

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
    RecipeCookingModeComponent
  ],
  styleUrls: ['./recipe-detail.page.scss']
})
export default class RecipeDetailPage {
  readonly recipeService = inject(RecipeService);

  readonly recipeId = input.required<string>();
  readonly isCookingMode = signal(false);

  readonly recipe = rxResource<RecipeDto, string | undefined>({
    params: () => this.recipeId(),
    stream: ({ params }) => this.recipeService.getRecipeById(params)
  });

  enterCookingMode(): void {
    this.isCookingMode.set(true);
  }

  exitCookingMode(): void {
    this.isCookingMode.set(false);
  }
}
