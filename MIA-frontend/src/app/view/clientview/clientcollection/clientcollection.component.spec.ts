import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { ClientcollectionComponent } from './clientcollection.component';
import { CollectionService } from '../../../services/collection.service';
import { LabelService } from '../../../services/label.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ClientcollectionComponent', () => {
  let component: ClientcollectionComponent;
  let fixture: ComponentFixture<ClientcollectionComponent>;
  let collectionService: jasmine.SpyObj<CollectionService>;
  let labelService: jasmine.SpyObj<LabelService>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const collectionServiceSpy = jasmine.createSpyObj('CollectionService', ['getclientCollectionImages']);
    const labelServiceSpy = jasmine.createSpyObj('LabelService', ['getCollectionLabel']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getClientId']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, HttpClientTestingModule, ClientcollectionComponent, HttpClientTestingModule], // Import HttpClientTestingModule for HttpClient testing
      providers: [
        { provide: CollectionService, useValue: collectionServiceSpy },
        { provide: LabelService, useValue: labelServiceSpy },
        { provide: AuthService, useValue: authSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => '1'  // Mocking CollectionID as 1
            })
          }
        },
        ChangeDetectorRef // ChangeDetectorRef should not be imported in imports array
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientcollectionComponent);
    component = fixture.componentInstance;
    collectionService = TestBed.inject(CollectionService) as jasmine.SpyObj<CollectionService>;
    labelService = TestBed.inject(LabelService) as jasmine.SpyObj<LabelService>;
    auth = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collection images', () => {
    const mockCollectionImages = [{ id: 1, url: 'image1.jpg' }];
    collectionService.getclientCollectionImages.and.returnValue(of(mockCollectionImages));

    component.loadCollectionImages(1); // Assuming CollectionID is 1

    expect(collectionService.getclientCollectionImages).toHaveBeenCalledWith(1, component.ClientID);
    expect(component.CollectionImages).toEqual(mockCollectionImages);
  });

  it('should load collection label', () => {
    const mockCollectionLabel = [{ id: 1, name: 'Label 1' }];
    labelService.getCollectionLabel.and.returnValue(of(mockCollectionLabel));

    component.loadCollectionLabel(1); // Assuming CollectionID is 1

    expect(labelService.getCollectionLabel).toHaveBeenCalledWith(1);
    expect(component.CollectionLabel).toEqual(mockCollectionLabel);
  });
});
