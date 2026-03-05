import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario no está autenticado, redirige al registro y bloquea el acceso a la ruta de perfil.
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/register']);
    return false;
  }

  return true;
};
