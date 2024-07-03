import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CollectionComponent } from './collection.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../../services/upload.service';
import { CollectionService } from '../../../services/collection.service';
import { LabelService } from '../../../services/label.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;
  let mockActivatedRoute: any;
  let mockUploadService: jasmine.SpyObj<UploadService>;
  let mockCollectionService: jasmine.SpyObj<CollectionService>;
  let mockLabelService: jasmine.SpyObj<LabelService>;

  beforeEach(waitForAsync(() => {
    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => '1' // Mocking route parameter with some id
      })
    };

    mockUploadService = jasmine.createSpyObj('UploadService', [
      'uploadFiles',
      'deleteImage',
      'deleteAllImages'
    ]);

    mockCollectionService = jasmine.createSpyObj('CollectionService', ['getadminCollectionImages']);
    mockCollectionService.getadminCollectionImages.and.returnValue(of([]));

    mockLabelService = jasmine.createSpyObj('LabelService', ['getCollectionLabel']);
    mockLabelService.getCollectionLabel.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [CollectionComponent, CommonModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: UploadService, useValue: mockUploadService },
        { provide: CollectionService, useValue: mockCollectionService },
        { provide: LabelService, useValue: mockLabelService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collection images and label on initialization', () => {
    const mockCollectionImages = [{ ImageID: 1, ImageName: 'Image 1' }, { ImageID: 2, ImageName: 'Image 2' }];
    const mockCollectionLabel = { LabelID: 1, LabelName: 'Label 1' };

    mockLabelService.getCollectionLabel.and.returnValue(of(mockCollectionLabel));
    mockCollectionService.getadminCollectionImages.and.returnValue(of(mockCollectionImages));

    component.ngOnInit();

    expect(component.CollectionImages).toEqual(mockCollectionImages);
    expect(component.CollectionLabel).toEqual(mockCollectionLabel);
  });

  it('should upload files successfully', () => {
    const file = new File(['content'], 'image.jpeg', { type: 'image/jpeg' });
    const files = {
      0: file,
      length: 1,
      item: (index: number) => file
    };

    mockUploadService.uploadFiles.and.returnValue(of({ message: 'File uploaded successfully' }));

    component.dragFiles({ target: { files } });

    expect(mockUploadService.uploadFiles).toHaveBeenCalledWith(files, component.CollectionID);
  });

  it('should delete all images', () => {
    const mockResponse = { message: 'Images deleted successfully' };

    mockUploadService.deleteAllImages.and.returnValue(of(mockResponse));

    component.deleteAllImages();

    expect(mockUploadService.deleteAllImages).toHaveBeenCalledWith(component.CollectionID);
    expect(component.CollectionImages.length).toBe(0);
  });
});
