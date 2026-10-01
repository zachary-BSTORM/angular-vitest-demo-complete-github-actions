import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from '../../../shared/services/auth/auth-services';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServices)
  const router = inject(Router)
  if(authService.isLogged()){
    return true;
  }
  router.navigateByUrl('/login')
  return false;
};
