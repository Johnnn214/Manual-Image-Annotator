import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username:string = "";
  password:string = "";
  errorMessage!: string;

  constructor(private authService: AuthService, private router: Router) { }

  logIn(): void {
    this.authService.login(this.username, this.password)
      .subscribe({ next: (data) => {
        console.log(data);
      // If login successful, navigate to home page
      this.router.navigate(['/home']);
      },
      error: (error) => {
        // Handle login error (display error message to user)
        console.log(error.error);
        this.errorMessage = error.error.error;
      }
    });
  }
}
