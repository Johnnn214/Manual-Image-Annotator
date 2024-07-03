import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authclientGuard } from './authclient.guard';

describe('authclientGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authclientGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
