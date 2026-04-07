import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map } from 'rxjs';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.initializeAuth()).pipe(
    map(() => {
      const user = authService.getCurrentUser();
      if (!user) {
        return router.createUrlTree(['/auth/login']);
      }

      return user.role === 'admin'
        ? true
        : router.createUrlTree(['/auth/profile']);
    })
  );
};
