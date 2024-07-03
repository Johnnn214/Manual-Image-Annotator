import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CollectionService } from '../../services/collection.service';
import { ActivatedRoute } from '@angular/router';
import { Baseurl } from '../../../baseurl';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css'
})
export class ImageGalleryComponent implements OnInit {

  @Input() collectionImages: any[] = [];
  @Input() currentImageIndex: number = 0;
  @Output() selectedImage: EventEmitter<any> = new EventEmitter<any>();
  @Output() updatedImageIndex: EventEmitter<any> = new EventEmitter<any>();

  isview: boolean = false;
  isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  index!: number;
  CollectionID!: number;
  CollectionName!: string;
  baseurl!: string;
  constructor(
    private authService: AuthService,
    private collectionService: CollectionService,
    private route: ActivatedRoute,
    private BaseUrl: Baseurl
   ){}




  ngOnInit() {
    this.emitSelectedImage();
    this.emitIndex();
    this.authService.isadmin().subscribe(isadmin =>{
      this.isAdmin.next(isadmin);
    });
    this.route.paramMap.subscribe(params => {
      this.CollectionID = Number(params.get('id')!);
      //console.log(this.CollectionID);
      this.loadCollectionName(this.CollectionID);
    });
    this.baseurl = this.BaseUrl.getBaseUrl();
    //console.log("base",this.baseurl);
  }


  loadCollectionName(CollectionID: number) {
    this.collectionService.getCollectionName(CollectionID)
      .subscribe(CollectionName => {
       this.CollectionName = CollectionName.CollectionName;
       console.log(CollectionName.CollectionName);
      });
  }
  /**
   * Set the current image index.
   * @param index The index of the image to display.
   * If the index is negative, set the index to 0.
   * If the index is greater than the maximum valid index, set the index to the maximum valid index.
   * If the index is within the valid range, set the index to the provided index.
   * Emit the selected image and the updated index.
   * Log a warning if the index is out of range.
   */
  setCurrentImage(index: number | undefined): void {
    if (index !== undefined) {
      const maxIndex = this.collectionImages.length - 1; // Calculate the maximum valid index
      if (index < 0) { // Check if the index is negative
        this.index = 0; // Set the index to 0
      } else if (index > maxIndex) { // Check if the index is greater than the maximum index
        this.index = maxIndex; // Set the index to the maximum valid index
      } else if (index >= 0 && index <= maxIndex) { // Check if the index is within the valid range
        this.index = index;
        this.currentImageIndex = this.index;
        this.emitSelectedImage();
        this.emitIndex();
      } else {
        console.warn(`Index ${index} is out of range.`);
      }
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.emitSelectedImage();
      this.emitIndex();
    }
    //console.log("idex", this.currentImageIndex);
  }

  nextImage() {
    if (this.currentImageIndex < this.collectionImages.length - 1) {
      this.currentImageIndex++;
      this.emitSelectedImage();
      this.emitIndex();
    }
    //console.log("idex", this.currentImageIndex);
  }

  private emitSelectedImage() {
    this.selectedImage.emit(this.collectionImages[this.currentImageIndex]);
  }
  private emitIndex() {
    this.updatedImageIndex.emit(this.currentImageIndex);
  }
}
