import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'M.I.A';
  @ViewChild('sidebar', {static: false}) sidebarElement!: ElementRef;

  constructor(private authService: AuthService, private router: Router
  ) { }
  isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLogin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLogin.next(isLoggedIn);
    });
    this.authService.isadmin().subscribe(isadmin =>{
      this.isAdmin.next(isadmin);
    });
  }


  signOut(): void {
    this.authService.logout();
    this.hideSidebar();
    this.router.navigate(['/']);
  }
  showSidebar(){
    this.sidebarElement.nativeElement.style.display = 'flex';
  }
  hideSidebar(){
    this.sidebarElement.nativeElement.style.display = 'none';
  }
  hideSidebarIfMobile() {
    if (window.innerWidth <= 430) {
      this.hideSidebar();
    }
  }

}
