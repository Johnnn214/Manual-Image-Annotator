import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Baseurl } from '../../baseurl';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private baseUrl: string;
  constructor( private http: HttpClient,
      	      private BaseUrl: Baseurl) {
       this.baseUrl = this.BaseUrl.getBaseUrl();
      }

  getAnnotations(ClientID: number,ImageID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/collection/annotation/${ClientID}/${ImageID}`);
  }

  addAnnotations(Annotation: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${this.baseUrl}api/collection/annotation`,{Annotation})
        .subscribe({
          next: (response) => {
            resolve(response);
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }

  updateAnnotation(Annotation: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put<any>(`${this.baseUrl}api/collection/annotation/update`, { Annotation })
      .subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
  });
  }

  deleteAnnotation(AnnotationID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.delete<any>(`${this.baseUrl}api/collection/annotation/delete/${AnnotationID}`)
      .subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
  });
  }

}
