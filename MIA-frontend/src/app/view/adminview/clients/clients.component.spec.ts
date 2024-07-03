import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClientsComponent } from './clients.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientService } from '../../../services/client.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let mockClientService: jasmine.SpyObj<ClientService>;

  beforeEach(waitForAsync(() => {
    mockClientService = jasmine.createSpyObj('ClientService', ['getClients']);

    TestBed.configureTestingModule({
      imports: [ClientsComponent, RouterTestingModule, CommonModule], // Import RouterTestingModule for navigation and CommonModule for ngIf, ngFor, etc.
      providers: [{ provide: ClientService, useValue: mockClientService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients on initialization', () => {
    const mockClients = [{ ClientID: 1, ClientName: 'Client 1' }, { ClientID: 2, ClientName: 'Client 2' }];

    // Mock the service method
    mockClientService.getClients.and.returnValue(of(mockClients));

    // Call ngOnInit
    component.ngOnInit();

    // Assert that clients are loaded correctly
    expect(component.clients).toEqual(mockClients);
  });

  // Example of testing clientCollection method (navigation)
  it('should navigate to client detail page', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const client = { ClientID: 1, ClientName: 'Client 1' };

    // Call clientCollection method
    component.clientCollection(client);

    // Expect router.navigate to have been called with the correct URL
    expect(router.navigate).toHaveBeenCalledWith(['/client/', client.ClientID]);
  });
});
