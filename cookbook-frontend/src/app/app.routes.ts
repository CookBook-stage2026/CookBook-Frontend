import { Routes } from '@angular/router';
import { authGuard } from '@core/services/auth/auth.guard';
import {MainLayoutComponent} from '@core/components/typescript/main-layout.component';

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
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'recipes',
        loadComponent: () => import('@features/recipe/recipe.page'),
      },
      {
        path: '',
        redirectTo: 'recipes',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'recipes/:recipeId',
    loadComponent: () => import('@features/recipe/recipe-detail.page')
  },
  {
    path: '**',
    redirectTo: 'recipes',
  },
];
