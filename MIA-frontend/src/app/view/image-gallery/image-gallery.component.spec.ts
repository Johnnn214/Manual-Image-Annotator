import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ImageGalleryComponent } from './image-gallery.component';
import { AuthService } from '../../services/auth.service';
import { CollectionService } from '../../services/collection.service';
import { ActivatedRoute } from '@angular/router';

describe('ImageGalleryComponent', () => {
  let component: ImageGalleryComponent;
  let fixture: ComponentFixture<ImageGalleryComponent>;
  let mockCollectionService: jasmine.SpyObj<CollectionService>;

  beforeEach(async () => {
    const collectionServiceSpy = jasmine.createSpyObj('CollectionService', ['getCollectionName']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ImageGalleryComponent // Standalone component
      ],
      providers: [
        AuthService,
        { provide: CollectionService, useValue: collectionServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => '1' // Mocking route parameter with some id
            })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageGalleryComponent);
    component = fixture.componentInstance;
    mockCollectionService = TestBed.inject(CollectionService) as jasmine.SpyObj<CollectionService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set CollectionName correctly when service call is successful', () => {
    const mockCollectionName = { CollectionName: 'Test Collection' };
    mockCollectionService.getCollectionName.and.returnValue(of(mockCollectionName));

    component.loadCollectionName(1);

    expect(component.CollectionName).toEqual('Test Collection');
  });

  it('should log the correct CollectionName', () => {
    const mockCollectionName = { CollectionName: 'Test Collection' };
    spyOn(console, 'log');
    mockCollectionService.getCollectionName.and.returnValue(of(mockCollectionName));

    component.loadCollectionName(1);

    expect(console.log).toHaveBeenCalledWith('Test Collection');
  });

  it('should increment currentImageIndex', () => {
    component.currentImageIndex = 0;
    component.collectionImages = ['image1', 'image2', 'image3']; // Example collectionImages

    component.nextImage();

    expect(component.currentImageIndex).toEqual(1); // Check if currentImageIndex is incremented
  });

  it('should decrement currentImageIndex', () => {
    component.currentImageIndex = 2;
    component.collectionImages = ['image1', 'image2', 'image3']; // Example collectionImages

    component.previousImage();

    expect(component.currentImageIndex).toEqual(1); // Check if currentImageIndex is incremented
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGalleryComponent);
    component = fixture.componentInstance;
    component.collectionImages = [
      { id: 1, url: 'image1.jpg' },
      { id: 2, url: 'image2.jpg' },
      { id: 3, url: 'image3.jpg' },
    ];
    fixture.detectChanges();
  });

  it('should set the index to 0 if the index is negative', () => {
    component.setCurrentImage(-1);
    expect(component.index).toBe(0);
  });

  it('should set the index to the maximum valid index if the index is greater than the maximum index', () => {
    component.setCurrentImage(5);
    expect(component.index).toBe(2);
  });

  it('should set the index to the provided index if it is within the valid range', () => {
    component.setCurrentImage(1);
    expect(component.index).toBe(1);
  });

});

