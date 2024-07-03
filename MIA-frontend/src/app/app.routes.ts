import { Routes } from '@angular/router';
import { ClientComponent } from './view/adminview/client/client.component';
import { authGuard } from './guard/auth.guard'
import { CollectionComponent } from './view/adminview/collection/collection.component';
import { LoginComponent } from './view/login/login.component';
import { CollectionsComponent } from './view/adminview/collections/collections.component';
import { ClientsComponent } from './view/adminview/clients/clients.component';
import { ClientcollectionsComponent } from './view/clientview/clientcollections/clientcollections.component';
import { ClientcollectionComponent } from './view/clientview/clientcollection/clientcollection.component';
import { authadminGuard } from './guard/authadmin.guard';
import { authclientGuard } from './guard/authclient.guard';
import { authloginGuard } from './guard/authlogin.guard';
import { HomeComponent } from './view/home/home.component';


export const routes: Routes = [
   // {path: '', canActivate: [authGuard, authadminGuard, authclientGuard]},
    {path: 'home', component: HomeComponent , canActivate: [authGuard]},
    {path: '', component: LoginComponent , canActivate: [authloginGuard]},
    {path: 'client/:id', component: ClientComponent, canActivate: [authGuard, authadminGuard]},
    {path: 'clients', component: ClientsComponent, canActivate: [authGuard, authadminGuard]},
    {path: 'collection/:id', component: CollectionComponent, canActivate: [authGuard, authadminGuard]},
    {path: 'collections', component:CollectionsComponent, canActivate: [authGuard, authadminGuard]},
    {path: 'clientcollection/:id', component: ClientcollectionComponent, canActivate: [authGuard, authclientGuard]},
    {path: 'clientcollections', component:ClientcollectionsComponent, canActivate: [authGuard, authclientGuard]},
];
