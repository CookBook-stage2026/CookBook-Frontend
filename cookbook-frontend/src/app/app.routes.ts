import { Routes } from '@angular/router';
import {authGuard} from '@core/services/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@core/components/typescript/auth/login.page'),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('@core/components/typescript/auth/callback.component').then((m) => m.CallbackComponent),
  },
  {
    path: 'recipes',
    canActivate: [authGuard],
    loadComponent: () => import('@features/recipe/recipe.page'),
  },
  {
    path: '**',
    redirectTo: 'recipes',
  },
];
