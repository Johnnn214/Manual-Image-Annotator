import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authloginGuard } from './authlogin.guard';

describe('authloginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authloginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
