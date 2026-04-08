import { Component, inject, input } from '@angular/core';
import { RecipeService } from '@shared/services/recipe';
import { RecipeDto, RecipeIngredientDto } from '@shared/domain/recipe';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { RecipeIngredientsComponent } from '@features/recipe/components/typescript/recipe-ingredients-list.component';
import { RecipePreparationComponent } from '@features/recipe/components/typescript/recipe-preparation-list';

const UNIT_LABELS: Record<string, { singular: string; plural: string }> = {
  GRAM:       { singular: 'g',     plural: 'g'     },
  KILOGRAM:   { singular: 'kg',    plural: 'kg'    },
  MILLILITER: { singular: 'ml',    plural: 'ml'    },
  LITER:      { singular: 'L',     plural: 'L'     },
  TEASPOON:   { singular: 'tsp',   plural: 'tsp'   },
  TABLESPOON: { singular: 'tbsp',  plural: 'tbsp'  },
  CUP:        { singular: 'cup',   plural: 'cups'  },
  PIECE:      { singular: 'pc',    plural: 'pcs'   },
};


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

  formatQuantity(item: RecipeIngredientDto): string {
    const { baseQuantity, unit } = item;
    if (!unit || unit === 'NONE') return ``;
    const { singular, plural } = UNIT_LABELS[unit];
    return `${baseQuantity} ${baseQuantity === 1 ? singular : plural}`;
  }
}
