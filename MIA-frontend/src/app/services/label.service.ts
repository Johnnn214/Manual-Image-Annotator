import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Baseurl } from '../../baseurl';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

  private baseUrl: string;

  constructor(private http: HttpClient, private BaseUrl: Baseurl) {
    this.baseUrl = this.BaseUrl.getBaseUrl(); }

  getCollectionLabel(CollectionID: number): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}api/collection/label/${CollectionID}`);
  }
  uploadLabelImage(labelID: number, file: File): Observable<any>{
    const formData = new FormData();
    formData.append('labelimage', file);
    formData.append('labelID', labelID.toString());
    console.log(labelID, file, formData);
    return this.http.post<any>(`${this.baseUrl}api/collection/label/upload`, formData);
  }
  uploadSubLabelImage(sublabelID: number, file: File): Observable<any>{
    const formData = new FormData();
    formData.append('sublabelimage', file);
    formData.append('sublabelID', sublabelID.toString());
    console.log(sublabelID, file, formData);
    return this.http.post<any>(`${this.baseUrl}api/collection/sublabel/upload`, formData);
  }

  getCollectionSublabel(LabelID: number): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}api/collection/sublabel/${LabelID}`);
  }

  addLabel(newLabel: string, CollectionID: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}api/collection/label`,{newLabel, CollectionID});
  }

  removeLabel(LabelID: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}api/collection/label/${LabelID}`);
  }

  addSublabel(newSublabel: string, LabelID: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}api/collection/sublabel`,{newSublabel, LabelID});
  }

  removeSublabel(SublabelID: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}api/collection/sublabel/${SublabelID}`);
  }
  editLabelName(LabelID: number, newEditedLabel: string, CollectionID: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}api/collection/label/${LabelID}`, {newEditedLabel, CollectionID});
  }
  editSubLabelName(SublabelID: number, newEditedSublabel: string, LabelID: number): Observable<any> {
    console.log(SublabelID, newEditedSublabel, LabelID);
    return this.http.put<any>(`${this.baseUrl}api/collection/sublabel/${SublabelID}`, {newEditedSublabel, LabelID});
  }
}
