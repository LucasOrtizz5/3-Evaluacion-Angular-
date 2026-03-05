import { Routes } from '@angular/router';
import { RegisterPage } from './pages/register-page/register-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { guestGuard } from './guards/guest-guard';
import { authGuard } from './guards/auth-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/register-page/register-page')
        .then(m => m.RegisterPage)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile-page/profile-page')
        .then(m => m.ProfilePage)
  }
];
