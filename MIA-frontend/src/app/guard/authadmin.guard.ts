import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authadminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot):Observable<boolean> | Promise<boolean> | boolean  => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userRole = authService.getRole();

    if (userRole === 'admin' ) {
      return true; // User is admin, allow access
    } else {
      router.navigate(['/clientcollections']);
      return false;
    }
};
