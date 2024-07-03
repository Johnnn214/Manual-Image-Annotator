import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Baseurl } from '../../baseurl';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private baseUrl: string;

  constructor(private http: HttpClient, private BaseUrl: Baseurl) {
    this.baseUrl = this.BaseUrl.getBaseUrl();
  }
  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/clients`);
  }

  getClientCollections(clientID: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/client/${clientID}`);
  }

  getUserData(clientID: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}api/client/data/${clientID}`);
  }

  grantPermission(clientID: number, collectionID: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}api/permission`, { clientID, collectionID });
  }

}
