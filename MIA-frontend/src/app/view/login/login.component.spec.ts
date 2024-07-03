import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule],
      providers: [
        LoginComponent, // Remove LoginComponent from declarations
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login method of AuthService and navigate to home page on successful login', () => {
    // Arrange
    const loginResponse = { token: 'mockToken' };
    authService.login.and.returnValue(of(loginResponse));

    // Act
    component.logIn();

    // Assert
    expect(authService.login).toHaveBeenCalledWith(component.username, component.password);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should set errorMessage on login error', () => {
    // Arrange
    const errorMessage = 'Invalid credentials';
    const errorResponse = { error: { error: errorMessage } };
    authService.login.and.returnValue(throwError(errorResponse));

    // Act
    component.logIn();

    // Assert
    expect(authService.login).toHaveBeenCalledWith(component.username, component.password);
    expect(component.errorMessage).toEqual(errorMessage);
  });
});
