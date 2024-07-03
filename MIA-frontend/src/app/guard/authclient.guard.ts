import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authclientGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot):Observable<boolean> | Promise<boolean> | boolean  => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userRole = authService.getRole();

    if (userRole === 'client' ) {
      return true; // User is admin, allow access
    } else {
      router.navigate(['/collections']);
      return false;
    }
};
