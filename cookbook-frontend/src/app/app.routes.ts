import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/typescript/home-page.component')
  },
  {
    path: 'ingredients',
    loadComponent: () => import('./features/ingredient/ingredient-page.component')
  },
  {
    path: '**',
    redirectTo: ''
  }
];
