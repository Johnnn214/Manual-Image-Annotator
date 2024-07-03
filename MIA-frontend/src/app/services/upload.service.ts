import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Baseurl } from '../../baseurl';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private baseUrl: string;

  constructor(private http: HttpClient, private BaseUrl: Baseurl) {
    this.baseUrl = this.BaseUrl.getBaseUrl();
  }

  uploadFiles(files: FileList, CollectionID: number) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
      // Append CollectionID to formData
    formData.append('CollectionID', CollectionID.toString());
    return this.http.post<any>(`${this.baseUrl}api/collection/upload`, formData);
  }

  deleteImage(collectionId: number, imageId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}api/collection/${collectionId}/image/${imageId}`);
  }

  deleteAllImages(collectionId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}api/collection/${collectionId}/images`);
  }
}
