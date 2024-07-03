import { inject } from '@angular/core';
import {  CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot):Observable<boolean> | Promise<boolean> | boolean  => {
    const authService = inject(AuthService);
    const router = inject(Router);

  // Subscribe to the Observable returned by authService.isLoggedIn()
  return new Observable<boolean>(observer => {
    authService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        observer.next(true); // User is authenticated, allow access
        observer.complete();
      } else {
        // User is not authenticated, redirect to login page
        router.navigate(['/']);
        observer.next(false);
        observer.complete();
      }
    });
  });
};
