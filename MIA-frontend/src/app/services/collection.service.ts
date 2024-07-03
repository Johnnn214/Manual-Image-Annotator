import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Baseurl } from '../../baseurl';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  private baseUrl: string;

  constructor(private http: HttpClient, private BaseUrl: Baseurl) {
    this.baseUrl = this.BaseUrl.getBaseUrl(); }

  getCollections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/collections`);
  }

  deleteCollection(CollectionID: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}api/collection/${CollectionID}`);
  }

  addCollection(CollectionName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}api/collection/`,{CollectionName});
  }

  editCollectionName(CollectionID: number, CollectionName: string): Observable<any>{
    return this.http.put<any>(`${this.baseUrl}api/collection/${CollectionID}`,{CollectionName});
  }

  getClientCollections(ClientID: number | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/clientcollections/${ClientID}`);
  }

  getCollectionName(CollectionID: number): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}api/collection/name/${CollectionID}`);
  }

  getadminCollectionImages(CollectionID: number): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}api/collection/admin/images/${CollectionID}`);
  }

  getclientCollectionImages(CollectionID: number, ClientID: number): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}api/collection/client/images/${CollectionID}/${ClientID}`, );
  }


}
