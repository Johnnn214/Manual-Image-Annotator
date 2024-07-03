import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';
import { Baseurl } from '../../baseurl';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl: string;
  private authTokenKey = 'authToken'; // Key to store the JWT token in localStorage
  private roleKey = 'role'; // Key to store the user role in localStorage
  private clientIdKey = 'clientId'; // Key to store the client ID in localStorage
  private isloggedIn = new BehaviorSubject<boolean>(false);
  private isAdmin = new BehaviorSubject<boolean>(false);


  constructor(private http: HttpClient, private BaseUrl: Baseurl) {
    this.baseUrl = this.BaseUrl.getBaseUrl();
    // Check if the JWT token exists in localStorage during initialization
    if (localStorage.getItem(this.authTokenKey)) {
      this.isloggedIn.next(true);
      if (localStorage.getItem(this.roleKey) == 'admin'){
        this.isAdmin.next(true);
      }else {
        this.isAdmin.next(false);
      }
    }
  }

  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post<any>(`${this.baseUrl}api/login`, body)
      .pipe(
        tap(response => {
          // Save JWT token, role, and client ID to localStorage upon successful login
          if (response && response.token) {
            localStorage.setItem(this.authTokenKey, response.token);
            localStorage.setItem(this.roleKey, response.role);
            this.isloggedIn.next(true);
            if (response.role === 'client' && response.clientId) {
              localStorage.setItem(this.clientIdKey, response.clientId);
            }
            if(this.getRole() == 'admin'){
              this.isAdmin.next(true);
            }else{
              this.isAdmin.next(false);
            }
          }
        })
      );
  }

  logout(): void {
    this.isloggedIn.next(false);
    // Clear authentication state and remove stored data from localStorage upon logout
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.clientIdKey);
  }

  isLoggedIn(): Observable<boolean> {
    // Return the observable of isLoggedInSubject
    return this.isloggedIn.asObservable();
  }

  isadmin(): Observable<boolean> {
    return this.isAdmin.asObservable();
  }


  getRole(): string | null {
    // Get the user role from localStorage
    return localStorage.getItem(this.roleKey);
  }


  getClientId(): number | null {
    // Get the client ID from localStorage
    const clientId = localStorage.getItem(this.clientIdKey);
    return clientId ? +clientId : null;
  }
  getUsernameFromToken(): string | null {
    const token = localStorage.getItem(this.authTokenKey);
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log(decodedToken);
        return decodedToken.username;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }
}
