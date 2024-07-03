import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class Baseurl{
  getBaseUrl(): string {
    return 'http://localhost:3000/';
     // change to your backend url
    }
}
