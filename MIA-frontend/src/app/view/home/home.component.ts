import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  constructor(private authService: AuthService){}

  role: string | null = "";
  username: string | null = "";
  ngOnInit(): void {
    this.getRole();
    this.getUsername();
  }
  getUsername(){
    this.username = String(this.authService.getUsernameFromToken());
  }

  getRole(){
    this.authService.isadmin().subscribe(isadmin => {
      if(isadmin == true){
        this.role= "Admin";
      }else{
        this.role= "Client";
      }
    });
  }



}
