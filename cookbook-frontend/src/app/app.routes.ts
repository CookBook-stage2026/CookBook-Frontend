import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'recipes',
    loadComponent: () => import('@features/recipe/recipe.page')
  },
  {
    path: '**',
    redirectTo: 'recipes'
  }
];
