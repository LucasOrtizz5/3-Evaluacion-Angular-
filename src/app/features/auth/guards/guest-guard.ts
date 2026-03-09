import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario ya está autenticado, redirige a characters y bloquea el acceso a auth pages.
  if (authService.isAuthenticated()) {
    router.navigate(['/characters']);
    return false;
  }

  return true;
};
