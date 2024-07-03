import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authadminGuard } from './authadmin.guard';

describe('authadminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authadminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
