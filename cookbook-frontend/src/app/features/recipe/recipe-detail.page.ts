import { Component, inject, input } from '@angular/core';
import { RecipeService } from '@shared/services/recipe';
import { RecipeDto } from '@shared/domain/recipe';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { RecipeIngredientsComponent } from '@features/recipe/components/typescript/recipe-ingredients-list.component';
import { RecipePreparationComponent } from '@features/recipe/components/typescript/recipe-preparation-list';

@Component({
  selector: 'app-recipe-detail-page',
  templateUrl: './recipe-detail.page.html',
  imports: [
    MatProgressSpinner,
    MatChipSet,
    MatChip,
    MatIcon,
    MatDivider,
    RecipeIngredientsComponent,
    RecipePreparationComponent
  ],
  styleUrls: ['./recipe-detail.page.scss']
})
export default class RecipeDetailPage {
  readonly recipeService = inject(RecipeService);

  readonly recipeId = input.required<string>();

  readonly recipe = rxResource<RecipeDto, string | undefined>({
    params: () => this.recipeId(),
    stream: ({ params }) => this.recipeService.getRecipeById(params)
  });
}
