import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CollectionsComponent } from './collections.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionService } from '../../../services/collection.service';
import { of, throwError } from 'rxjs';

describe('CollectionsComponent', () => {
  let component: CollectionsComponent;
  let fixture: ComponentFixture<CollectionsComponent>;
  let collectionService: jasmine.SpyObj<CollectionService>;

  beforeEach(waitForAsync(() => {
    collectionService = jasmine.createSpyObj('CollectionService', [
      'getCollections',
      'addCollection',
      'editCollectionName',
      'deleteCollection'
    ]);
    collectionService.getCollections.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterTestingModule, CollectionsComponent],
      providers: [{ provide: CollectionService, useValue: collectionService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collections on initialization', () => {
    const mockCollections = [
      { CollectionID: 1, CollectionName: 'Collection 1' },
      { CollectionID: 2, CollectionName: 'Collection 2' }
    ];

    collectionService.getCollections.and.returnValue(of(mockCollections));

    component.ngOnInit();

    expect(component.collections).toEqual(mockCollections);
    expect(component.iscollapsed.length).toEqual(mockCollections.length);
    expect(component.collapse.length).toEqual(mockCollections.length);
  });

  it('should add a new collection', () => {
    const newCollectionName = 'New Collection';

    collectionService.addCollection.and.returnValue(of('New Collection'));
    component.addCollection(newCollectionName);

    expect(collectionService.addCollection).toHaveBeenCalledWith(newCollectionName);
    expect(component.newCollectionName).toBe('');
    expect(component.errorMessage).toBe('');
    //collectionService.getCollections.and.returnValue(of(component.collections));
    //expect(component.collections.length).toBeGreaterThan(0); // Assuming collections are reloaded
  });

  it('should handle error when adding a collection', () => {
    const newCollectionName = 'New Collection';
    const errorMessage = 'Error adding collection';

    collectionService.addCollection.and.returnValue(throwError({ error: { error: errorMessage } }));

    component.addCollection(newCollectionName);

    expect(component.newCollectionName).toBe('');
    expect(component.errorMessage).toBe(errorMessage);
    expect(component.collections.length).toBe(0); // Collections should not be modified on error
  });

  it('should edit an existing collection name', () => {
    const collectionID = 1;
    const editedCollectionName = 'Edited Collection';

    collectionService.editCollectionName.and.returnValue(of(''));

    component.editCollectionName(collectionID, editedCollectionName, 0);

    expect(collectionService.editCollectionName).toHaveBeenCalledWith(collectionID, editedCollectionName);
    expect(component.editerrorMessage).toEqual([]);
    expect(component.newCollectionName).toBe('');
  });

  it('should handle error when editing a collection name', () => {
    const collectionID = 1;
    const editedCollectionName = 'Edited Collection';
    const errorMessage = 'Error editing collection';

    collectionService.editCollectionName.and.returnValue(throwError({ error: { error: errorMessage } }));

    component.editCollectionName(collectionID, editedCollectionName, 0);

    expect(component.editerrorMessage[0]).toBe(errorMessage);
    expect(component.collections.length).toBe(0); // Collections should not be modified on error
  });

  it('should delete a collection', () => {
    const collectionID = 1;
    const initialCollectionCount = 2; // Assuming 2 collections initially

    collectionService.deleteCollection.and.returnValue(of(undefined));

    component.collections = [
      { CollectionID: 1, CollectionName: 'Collection 1' },
      { CollectionID: 2, CollectionName: 'Collection 2' }
    ];
    component.iscollapsed = [false, false];
    component.collapse = ['', ''];

    component.deleteCollection(collectionID, 0);

    expect(collectionService.deleteCollection).toHaveBeenCalledWith(collectionID);
    expect(component.collections.length).toBe(initialCollectionCount - 1);
    expect(component.iscollapsed.length).toBe(initialCollectionCount - 1);
    expect(component.collapse.length).toBe(initialCollectionCount - 1);
  });

  it('should handle error when deleting a collection', () => {
    const collectionID = 1;
    const errorMessage = 'Error deleting collection';

    collectionService.deleteCollection.and.returnValue(throwError({ error: { error: errorMessage } }));

    component.deleteCollection(collectionID, 0);

    expect(component.collections.length).toBe(0); // Collections should not be modified on error
  });
});
