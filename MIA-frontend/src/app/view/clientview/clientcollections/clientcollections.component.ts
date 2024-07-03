import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-clientcollections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientcollections.component.html',
  styleUrl: './clientcollections.component.css'
})
export class ClientcollectionsComponent {
  collections: any[] =[];
  collection: any;
  newCollectionName: string = "";

  constructor(
    private collectionService: CollectionService,
    private router: Router,
    private auth: AuthService

  ) { }

  ngOnInit(): void {
    this.loadclientCollections();
  }

  loadclientCollections(): void {
    this.collectionService.getClientCollections(this.auth.getClientId())
      .subscribe(collections => {
        this.collections = collections;
        //console.log(this.collections);
      });
  }

  clickCollection(collection: any) {
    this.router.navigate(['/clientcollection',collection.CollectionID]);
    // Navigate to the separate page with the client's ID as a parameter
  }


}
