import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { ClientsService } from './clients.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { COUNTRY_CODES, CountryCode } from './country-codes';

interface ClientData {
  id: string;
  phone: string;
  addedBy: string;
  createdAt: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
})
export class ClientsComponent implements OnInit {
  clientData: ClientData[] = [];
  createClientForm: FormGroup;
  updateClientForm: FormGroup;
  selectedClientId: string | null = null;
  errorMessage: string | null = null;
  countryCodes: CountryCode[] = COUNTRY_CODES;
  page: number = 1;
  limit: number = 10;
  totalClients: number = 0;

  constructor(
    private clientsService: ClientsService,
    private fb: FormBuilder,
  ) {
    this.createClientForm = this.fb.group({
      countryCode: ['+20', [Validators.required]], // Default to Egypt
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    });

    this.updateClientForm = this.fb.group({
      countryCode: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    });
  }

  ngOnInit(): void {
    this.getClients();
  }

  getClients(): void {
    this.clientsService.getClients(this.page, this.limit).subscribe(
      (data: { clients: ClientData[]; total: number }) => {
        this.clientData = data.clients || [];
        this.totalClients = data.total;
        console.log('Clients fetched:', this.clientData);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        this.errorMessage = 'Failed to load clients';
      }
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalClients / this.limit);
  }

    
  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.getClients();
    }
  }
  
  nextPage() {
    if (this.page * this.limit < this.totalClients) {
      this.page++;
      this.getClients();
    }
  }
  

  createClient(): void {
    if (this.createClientForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    const { countryCode, phone } = this.createClientForm.value;
    const fullPhone = `${countryCode}${phone}`;
    this.clientsService.createClient({ phone: fullPhone }).subscribe(
      (newClient) => {
        this.clientData.push(newClient as ClientData);
        this.createClientForm.reset({ countryCode: '+20' });
        this.errorMessage = null;
        const modal = document.getElementById('createClientModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          bootstrapModal?.hide();
        }
        this.getClients();
      },
      (error) => {
        console.error('Error creating client:', error);
        this.errorMessage = error.error?.error || 'Failed to create client';
      }
    );
  }

  openUpdateModal(client: ClientData): void {
    this.selectedClientId = client.id;
    // Split phone into countryCode and phone
    const phone = client.phone;
    const countryCode = this.countryCodes.find(code => phone.startsWith(code.code))?.code || '+20';
    const phoneNumber = phone.replace(countryCode, '');
    this.updateClientForm.patchValue({
      countryCode,
      phone: phoneNumber,
    });
  }

  updateClient(): void {
    if (this.updateClientForm.invalid || !this.selectedClientId) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    const { countryCode, phone } = this.updateClientForm.value;
    const fullPhone = `${countryCode}${phone}`;
    this.clientsService.updateClient(this.selectedClientId, { phone: fullPhone }).subscribe(
      (updatedClient) => {
        const index = this.clientData.findIndex((c) => c.id === this.selectedClientId);
        if (index !== -1) {
          this.clientData[index] = { ...this.clientData[index], ...updatedClient };
        }
        this.updateClientForm.reset();
        this.selectedClientId = null;
        this.errorMessage = null;
        const modal = document.getElementById('updateClientModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          bootstrapModal?.hide();
        }
        this.getClients();
      },
      (error) => {
        console.error('Error updating client:', error);
        this.errorMessage = error.error?.error || 'Failed to update client';
      }
    );
  }

  openDeleteModal(clientId: string): void {
    this.selectedClientId = clientId;
  }

  deleteClient(): void {
    if (!this.selectedClientId) return;

    this.clientsService.deleteClient(this.selectedClientId).subscribe(
      () => {
        this.clientData = this.clientData.filter((c) => c.id !== this.selectedClientId);
        this.selectedClientId = null;
        this.errorMessage = null;
        const modal = document.getElementById('deleteClientModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          bootstrapModal?.hide();
        }
        this.getClients();
      },
      (error) => {
        console.error('Error deleting client:', error);
        this.errorMessage = error.error?.error || 'Failed to delete client';
      }
    );
  }
}