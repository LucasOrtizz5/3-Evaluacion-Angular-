import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    //Implementacion de Lazy Loading. (No se cargan las rutas de auth hasta que el usuario entre a /auth)
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  }
];
