import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsernameFromToken', 'isadmin']);

    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getUsername', () => {
    it('should set username correctly from AuthService', () => {
      const mockUsername = 'testuser';
      authService.getUsernameFromToken.and.returnValue(mockUsername);

      component.getUsername();

      expect(component.username).toEqual(mockUsername);
    });
  });

  describe('getRole', () => {
    it('should set role to "Admin" when AuthService returns true', () => {
      authService.isadmin.and.returnValue(of(true));

      component.getRole();

      expect(component.role).toEqual('Admin');
    });

    it('should set role to "Client" when AuthService returns false', () => {
      authService.isadmin.and.returnValue(of(false));

      component.getRole();

      expect(component.role).toEqual('Client');
    });
  });
});
