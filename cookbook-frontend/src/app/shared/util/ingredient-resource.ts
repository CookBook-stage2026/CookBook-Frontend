import { IngredientService } from '@shared/services/ingredient';
import { rxResource } from '@angular/core/rxjs-interop';
import { Signal } from '@angular/core';
import { of } from 'rxjs';

export function createIngredientSearchResource(
  debouncedQuery: Signal<string>,
  ingredientService: IngredientService
) {
  return rxResource({
    params: () => ({ query: debouncedQuery() }),
    stream: ({ params }) => {
      if (params.query.length < 1) {
        return of({
          content: [],
          page: { totalPages: 0, totalElements: 0, size: 0, number: 0 }
        });
      }

      return ingredientService.searchIngredients({
        query: params.query,
        alreadySelectedIds: [],
        page: 0,
        size: 10,
        onlyPersonal: false
      });
    }
  });
}
