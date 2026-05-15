import { MainLayoutComponent } from '@core/components/typescript/main-layout.component';
import { authGuard } from '@core/services/auth/auth.guard';
import { Routes } from '@angular/router';

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
    path: 'invite/:token',
    loadComponent: () =>
      import('@features/household/accept-invite.page'),
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
        path: 'preferences',
        loadComponent: () => import('@features/user/preferences.page'),
      },
      {
        path: 'schedules',
        loadComponent: () => import('@features/user/schedule.page'),
      },
      {
        path: 'households',
        loadComponent: () => import('@features/household/household.page'),
      },
      {
        path: '',
        redirectTo: 'recipes',
        pathMatch: 'full'
      },
      {
        path: 'recipes/:recipeId',
        loadComponent: () => import('@features/recipe/recipe-detail.page')
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'recipes',
  },
];
