import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'ingredients'
  },
  {
    path: 'ingredients',
    loadComponent: () => import('./features/ingredient/ingredient-page.component')
  },
  {
    path: '**',
    redirectTo: 'ingredients'
  }
];
