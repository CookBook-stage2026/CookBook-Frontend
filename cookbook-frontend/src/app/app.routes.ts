import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'recipes',
    loadComponent: () => import('@features/recipe/recipe.page')
  },
  {
    path: 'recipes/:recipeId',
    loadComponent: () => import('@features/recipe/recipe-detail.page')
  },
  {
    path: '**',
    redirectTo: 'recipes'
  }
];
