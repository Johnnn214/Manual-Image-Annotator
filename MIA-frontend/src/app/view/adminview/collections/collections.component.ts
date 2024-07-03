import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../../services/collection.service';
import { Router } from '@angular/router';
import { error } from 'console';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.css'
})
export class CollectionsComponent implements OnInit {
  collections: any[] =[];
  collection: any;
  newCollectionName: string = "";
  editedCollectionName: string[] = []
  errorMessage!: string;
  iscollapsed: boolean[] = [];
  collapse: any[] = [];
  coll = ' show'
  editerrorMessage: string[] = [];
  constructor(
    private collectionService: CollectionService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.loadCollections();
  }

  toggleisCollapsedState(index: number, newState: boolean): void {
    this.iscollapsed[index] = newState;
    this.collapse[index] = newState ? ' show' : '';
  }

  loadCollections(): void {
    const currentCollapseState = this.iscollapsed ?? [];
    this.collectionService.getCollections()
      .subscribe({
        next: (collections) => {
          this.collections = collections;
          this.editedCollectionName = new Array(collections.length).fill("");
          this.editerrorMessage = new Array(collections.length).fill("");
          this.iscollapsed = [];
          this.collapse = [];
          collections.forEach((collection, index) => {
            this.iscollapsed[index] = currentCollapseState[index] ?? false;
            this.collapse[index] = this.iscollapsed[index] ? ' show' : '';
          });
        },
        error: (error) => {
          console.error('Error loading collections:', error);
          this.collections = [];
          this.iscollapsed = [];
          this.collapse = [];
        }
      });
  }

  clickCollection(collection: any) {
    //this.router.navigate(['/collection/', client.ClientID]);
    this.router.navigate(['/collection',collection.CollectionID]);
    // Navigate to the separate page with the client's ID as a parameter
  }

  deleteCollection(CollectionID: number, index: number): void {
    this.collectionService.deleteCollection(CollectionID)
      .subscribe({
        next: () => {
          console.log('Collection deleted successfully');
          // Perform any additional actions after deletion, such as reloading the collections
          this.collections.splice(index, 1);
          this.iscollapsed.splice(index, 1);
          this.collapse.splice(index, 1);
          this.editerrorMessage.splice(index, 1);
          //this.loadCollections();
        },
        error:(error) => {
          console.error('Error deleting collection:', error);
          // Handle error, if necessary
        }
    });
  }

  addCollection(CollectionName: string): void {
    if (CollectionName.length < 3) {
      this.errorMessage = 'Collection name must have at least 3 characters';
    } else {
      this.collectionService.addCollection(CollectionName)
      .subscribe({
        next: () => {
          console.log('Collection created successfully');
          // Clear the input field
          this.newCollectionName="";
          this.errorMessage="";
          // Perform any additional actions after adding, such as reloading the collections
          this.loadCollections();

        },
        error:(error) => {
          this.newCollectionName="";
          this.errorMessage = error.error.error;
        }
      });
    }
  }
  editCollectionName(CollectionID: number, editedCollectionName: string, i: number): void {
    if (editedCollectionName.length < 3) {
      this.editerrorMessage[i] = 'Collection name must have at least 3 characters';
    } else {
      this.collectionService.editCollectionName(CollectionID, editedCollectionName)
        .subscribe({
          next: () => {
            console.log('Collection edited successfully');
            this.loadCollections();
            this.newCollectionName="";
            this.errorMessage="";
            this.editerrorMessage = new Array(this.collections.length).fill("");
          },
          error: (error) => {
            console.error('Error editing collection:', error);
            this.editedCollectionName[i] = "";
            this.editerrorMessage = new Array(this.collections.length).fill("");
            this.editerrorMessage[i] =error.error.error;
          }
        });
    }
   }
}
