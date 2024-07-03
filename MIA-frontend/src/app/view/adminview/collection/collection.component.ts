import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { FormsModule } from '@angular/forms';
import { ImageGalleryComponent } from "../../image-gallery/image-gallery.component";
import { LabelComponent } from '../label/label.component';
import { UploadService } from '../../../services/upload.service';
import { LabelService } from '../../../services/label.service';

@Component({
    selector: 'app-collection',
    standalone: true,
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.css'],
    imports: [CommonModule, FormsModule, ImageGalleryComponent, LabelComponent]
})
export class CollectionComponent {

  CollectionID!: number;
  CollectionName!: string;
  CollectionImages: any[] = [];
  currentImageIndex: number = 0;
  selectedFiles: any;
  CollectionLabel: any;
  ischecked: boolean = false;
  ischeckedall:boolean =false;
  errorMessageupload!: string;

  @ViewChild('fileinput', { static: false }) fileInput!: ElementRef;

  constructor(
    private uploadService: UploadService,
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private labelService: LabelService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.CollectionID = +params.get('id')!;
      this.loadCollectionImages(this.CollectionID);
      this.loadCollectionLabel(this.CollectionID);
    });
  }

  loadCollectionImages(CollectionID: number) {
    this.collectionService.getadminCollectionImages(CollectionID)
      .subscribe(CollectionImages => {
        this.CollectionImages = CollectionImages;
      });
  }


  dragFiles(event: any) {
    const files: FileList = event.target.files;
    this.uploadService.uploadFiles(files, this.CollectionID)
      .subscribe({
        next: (response) => {
          console.log('Upload successful:', response.message);
          this.loadCollectionImages( this.CollectionID);
        },
        error:(error) => {
          //console.error('Upload error:', error.error);
          this.errorMessageupload = error.error.error;
          console.log(this.errorMessageupload);
          this.loadCollectionImages(this.CollectionID);
        }
      });
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  onSubmit() {
    if (!this.selectedFiles || this.selectedFiles.length === 0) return;
    this.uploadService.uploadFiles(this.selectedFiles, this.CollectionID)
      .subscribe({
        next: (response) => {
          console.log('Upload successful:', response.message);
          this.loadCollectionImages(this.CollectionID);
        },
        error: (error) => {
          //console.error('Upload error:', error.error);
          this.errorMessageupload = error.error.error;
          console.log(this.errorMessageupload);
          this.loadCollectionImages(this.CollectionID);
        },
        complete: () => {
          // Reset file input
          this.selectedFiles = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        }
      });
  }

  deleteCurrentImage(): void {
    const imageId = this.CollectionImages[this.currentImageIndex].ImageID;
    console.log(this.CollectionImages[this.currentImageIndex].ImageID);
    const collectionId = this.CollectionID;

    this.uploadService.deleteImage(collectionId, imageId)
      .subscribe({
        next: (response) => {
          console.log('Image deleted successfully:', response);
          // Remove the deleted image from the collection
          this.CollectionImages.splice(this.currentImageIndex, 1);
          // If the last image was deleted and the current index is not already at the last position, decrement the index
          if (this.currentImageIndex === this.CollectionImages.length && this.currentImageIndex !== 0) {
            this.currentImageIndex--;
          }
          // Reload images after deletion
          this.loadCollectionImages(this.CollectionID);
        },
        error: (error) => {
          console.error('Error deleting image:', error);
        }
      });
  }

  toggleCheck(){
    this.ischecked = !this.ischecked;
  }

  toggleCheckall(){
    this.ischeckedall = !this.ischeckedall;
  }

  deleteAllImages(): void {
    const collectionId = this.CollectionID;

    this.uploadService.deleteAllImages(collectionId)
      .subscribe({
        next: (response: any) => {
          console.log('Images deleted successfully:', response);
          this.CollectionImages = [];
          this.currentImageIndex = 0;
        },
        error: (error: any) => {
          console.error('Error deleting all images:', error);
        }
      });
  }

  loadCollectionLabel(CollectionID: number): void{
    this.labelService.getCollectionLabel(CollectionID)
    .subscribe(CollectionLabel => {
      this.CollectionLabel = CollectionLabel;
      //console.log(this.CollectionLabel);
    });
  }

  updatedcurrentImageIndex(updatedImageIndex: any): void {
    this.currentImageIndex = updatedImageIndex
  }
}
