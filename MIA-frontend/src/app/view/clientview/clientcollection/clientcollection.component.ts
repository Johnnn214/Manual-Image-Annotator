import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { FormsModule } from '@angular/forms';
import { ImageGalleryComponent } from "../../image-gallery/image-gallery.component";
import { ImageAnnotatorComponent } from '../imageannotator/imageannotator.component';
import { LabelService } from '../../../services/label.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-clientcollection',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ImageGalleryComponent,
    ImageAnnotatorComponent
  ],
  templateUrl: './clientcollection.component.html',
  styleUrl: './clientcollection.component.css'
})
export class ClientcollectionComponent {

  CollectionID!: number;
  CollectionName!: string;
  CollectionImages: any;
  currentImageIndex: number = 0;
  CollectionLabel: any;
  selectedimage: any;
  ClientID: number = 1;

  constructor(
    private collectionService: CollectionService,
    private labelService: LabelService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.CollectionID = +params.get('id')!;
      //console.log(this.CollectionID);
      this.ClientID = this.auth.getClientId()!;
      this.loadCollectionImages(this.CollectionID);
      this.loadCollectionLabel(this.CollectionID);

    });
  }

  loadCollectionImages(CollectionID: number) {
    this.collectionService.getclientCollectionImages(CollectionID, this.ClientID)
      .subscribe(CollectionImages => {
        this.CollectionImages = CollectionImages;
      });
  }

  loadCollectionLabel(CollectionID: number) {
    this.labelService.getCollectionLabel(CollectionID)
    .subscribe(CollectionLabel => {
      this.CollectionLabel = CollectionLabel;
      //console.log(this.CollectionLabel);
    });
  }

  selectedImage(selectedimage: any) {
    // console.log('Selected Image:', selectedImage);
    this.selectedimage = selectedimage
    this.cdr.detectChanges();
    // Manually trigger change detection
    //console.log('Selected Image:', this.selectedImage);
  }

}
