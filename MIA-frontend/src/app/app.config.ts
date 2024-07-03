import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
//import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

export const appConfig: ApplicationConfig = {
  //added  provideHttpClient()
  providers: [provideRouter(routes),
  {provide: LocationStrategy, useClass: HashLocationStrategy},
   provideHttpClient(withFetch())]
};
