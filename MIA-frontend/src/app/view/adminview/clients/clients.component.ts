import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../services/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
  clients: any[] =[];

  constructor(private clientService: ClientService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getClients()
      .subscribe(clients => {
        this.clients = clients;
        console.log(this.clients);
      });
  }

  clientCollection(client: any) {
    this.router.navigate(['/client/', client.ClientID]);
    // Navigate to the separate page with the client's ID as a parameter
  }

}
