import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClientComponent } from './client.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClientService } from '../../../services/client.service';

describe('ClientComponent', () => {
  let component: ClientComponent;
  let fixture: ComponentFixture<ClientComponent>;
  let clientService: jasmine.SpyObj<ClientService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create a mock ActivatedRoute
    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => '1' // Mocking route parameter with some id
      })
    };

    // Create a spy object for ClientService
    const clientServiceSpy = jasmine.createSpyObj('ClientService', ['getUserData', 'getClientCollections', 'grantPermission']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ClientComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ClientService, useValue: clientServiceSpy } // Provide the spy clientService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientComponent);
    component = fixture.componentInstance;
    clientService = TestBed.inject(ClientService) as jasmine.SpyObj<ClientService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data and collections on initialization', fakeAsync(() => {
    // Mock getUserData to return user data
    clientService.getUserData.and.returnValue(of({ Username: 'TestUser' }));

    // Mock getClientCollections to return collections
    clientService.getClientCollections.and.returnValue(of([{ CollectionID: 1, CollectionName: 'Collection 1' }]));

    // Trigger ngOnInit
    component.ngOnInit();

    // Use tick to simulate the passage of time (e.g., wait for 1000 milliseconds)
    tick(1000);

    // Expect username and collections to be loaded
    expect(component.username).toEqual('TestUser');
    expect(component.collections.length).toEqual(1);
    expect(component.collections[0]).toEqual({ CollectionID: 1, CollectionName: 'Collection 1' });
  }));

  it('should call loadCollections after granting permission', () => {
    clientService.grantPermission.and.returnValue(of(null));
    spyOn(component, 'loadCollections'); // Spy on loadCollections method

    component.grantPermission(1);

    // Expect loadCollections to have been called
    expect(component.loadCollections).toHaveBeenCalled();
  });

  it('should log error if grantPermission fails', () => {
    clientService.grantPermission.and.returnValue(throwError('Error'));
    spyOn(console, 'error'); // Spy on console.error method

    component.grantPermission(1);

    // Expect console.error to have been called with specific message
    expect(console.error).toHaveBeenCalledWith('Error granting permission:', 'Error');
  });

  // Clean up after each test to avoid test interference
  afterEach(() => {
    TestBed.resetTestingModule();
  });
});
