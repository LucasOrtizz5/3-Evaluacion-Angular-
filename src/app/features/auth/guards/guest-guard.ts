import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario ya está autenticado, redirige al perfil y bloquea el acceso a la ruta de registro.
  if (authService.isAuthenticated()) {
    router.navigate(['/auth/profile']);
    return false;
  }

  return true;
};
