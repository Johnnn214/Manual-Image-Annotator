import { Component } from '@angular/core';
import { Router } from 'express';
import { ClientService } from '../../../services/client.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
  username!: string;
  clientID!: number;
  collections: any[] = [];

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.clientID = +params.get('id')!;
      // Get clientID from route parameters
      this.loadUserData()
      this.loadCollections();
    });
  }

  loadUserData() {
    this.clientService.getUserData(this.clientID)
      .subscribe(userData => {
        this.username = userData.Username;
      });
  }

  loadCollections() {
    console.log('Loading collections for client:', this.clientID);
    this.clientService.getClientCollections(this.clientID)
      .subscribe({
        next: collections => {
          console.log('Collections loaded:', collections);
          this.collections = collections;
          console.log('Collections assigned to component:', this.collections);
        },
        error: error => {
          console.error('Error loading collections:', error);
        }
      });
  }

  grantPermission(collectionID: number) {
    this.clientService.grantPermission(this.clientID, collectionID)
      .subscribe({
        next: () => {
          // Reload collections after granting permission
          this.loadCollections();
        },
        error: (error) => {
          console.error('Error granting permission:', error);
          // Handle error here, if necessary
        }
      });
  }
}
