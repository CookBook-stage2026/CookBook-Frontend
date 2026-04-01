import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@features/home/home.page')
  },
  {
    path: 'recipes',
    loadComponent: () => import('@features/recipe/recipe.page')
  },
  {
    path: '**',
    redirectTo: ''
  }
];
