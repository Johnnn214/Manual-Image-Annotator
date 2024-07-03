import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientcollectionsComponent } from './clientcollections.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';

describe('ClientcollectionsComponent', () => {
  let component: ClientcollectionsComponent;
  let fixture: ComponentFixture<ClientcollectionsComponent>;
  let collectionService: jasmine.SpyObj<CollectionService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const collectionServiceSpy = jasmine.createSpyObj('CollectionService', ['getClientCollections']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getClientId']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ClientcollectionsComponent],
      providers: [
        { provide: CollectionService, useValue: collectionServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientcollectionsComponent);
    component = fixture.componentInstance;
    collectionService = TestBed.inject(CollectionService) as jasmine.SpyObj<CollectionService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load client collections on initialization', () => {
    const mockCollections = [{ CollectionID: 1, name: 'Collection 1' }, { CollectionID: 2, name: 'Collection 2' }];
    collectionService.getClientCollections.and.returnValue(of(mockCollections));

    fixture.detectChanges(); // Trigger ngOnInit()

    expect(collectionService.getClientCollections).toHaveBeenCalledTimes(1);
    expect(component.collections).toEqual(mockCollections);
  });

  it('should navigate to client collection page on click', () => {
    const navigateSpy = spyOn(router, 'navigate').and.stub(); // Stub the router.navigate method

    const mockCollection = { CollectionID: 1, name: 'Collection 1' };
    component.clickCollection(mockCollection);

    expect(navigateSpy).toHaveBeenCalledWith(['/clientcollection', mockCollection.CollectionID]);
  });
});
