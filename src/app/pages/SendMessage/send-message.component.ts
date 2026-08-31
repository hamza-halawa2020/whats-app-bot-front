import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SendMessageService } from './send-message.service';
import { ClientsService } from '../clients/clients.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { COUNTRY_CODES, CountryCode } from '../clients/country-codes';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

interface ClientData {
  id: string;
  phone: string;
  addedBy: string;
  createdAt: string;
}

interface Schedule {
  id: string;
  phoneNumbers: string[];
  messagePool: string[];
  intervalMs: number;
  repeatCount: number;
  sentCount: number;
  status: 'active' | 'paused' | 'completed';
  lastSent?: string;
  createdAt: string;
}

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css'],
})
export class SendMessageComponent implements OnInit {
  sendMessageForm: FormGroup;
  broadcastForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSendingMessage = false;
  isSendingBroadcast = false;
  countryCodes: CountryCode[] = COUNTRY_CODES;
  clients: ClientData[] = [];
  schedules: Schedule[] = [];
  activeTab: 'single' | 'broadcast' | 'schedules' = 'single';
  totalClients: number = 0;
  currentPage: number = 1;
  pageSize: number = 100;
  totalPages: number = 0;
  walletPoints: number = 0;

  constructor(
    private sendMessageService: SendMessageService,
    private clientsService: ClientsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.sendMessageForm = this.fb.group({
      inputType: ['manual', [Validators.required]],
      countryCode: ['+20', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      clientId: [''],
      message: ['', [Validators.required, Validators.minLength(1)]],
    });

    this.broadcastForm = this.fb.group({
      phoneNumbers: ['', [Validators.required]],
      messagePool: ['', [Validators.required, Validators.minLength(1)]],
      batchSize: [10, [Validators.required, Validators.min(1)]],
      intervalMs: [5000, [Validators.required, Validators.min(1000)]],
      repeatIntervalMs: [0, [Validators.min(0)]],
      repeatCount: [0, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadSchedules();
    this.loadUserWallet();
    this.setupSendMessageFormListeners();
  }

  loadUserWallet(): void {
    this.authService.refreshMe().subscribe({
      next: (response) => {
        this.walletPoints = response.user.walletPoints || 0;
      },
      error: () => {
        this.walletPoints = this.authService.getUser()?.walletPoints || 0;
      },
    });
  }

  loadClients(): void {
    this.clientsService.getClients(this.currentPage, this.pageSize).subscribe(
      (data: { clients: ClientData[]; total: number }) => {
        this.clients = data.clients || [];
        this.totalClients = data.total;
        this.totalPages = Math.ceil(this.totalClients / this.pageSize);
        console.log('Clients fetched:', this.clients);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        this.errorMessage = 'Failed to load clients';
      }
    );
  }

  loadSchedules(): void {
    this.sendMessageService.getSchedules().subscribe(
      (response) => {
        this.schedules = response.schedules || [];
        console.log('Schedules fetched:', this.schedules);
      },
      (error) => {
        console.error('Error fetching schedules:', error);
        this.errorMessage = 'Failed to load schedules';
      }
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  setupSendMessageFormListeners(): void {
    this.sendMessageForm.get('inputType')?.valueChanges.subscribe((value) => {
      if (value === 'manual') {
        this.sendMessageForm
          .get('countryCode')
          ?.setValidators([Validators.required]);
        this.sendMessageForm
          .get('phone')
          ?.setValidators([
            Validators.required,
            Validators.pattern(/^\d{10,15}$/),
          ]);
        this.sendMessageForm.get('clientId')?.clearValidators();
      } else {
        this.sendMessageForm.get('countryCode')?.clearValidators();
        this.sendMessageForm.get('phone')?.clearValidators();
        this.sendMessageForm
          .get('clientId')
          ?.setValidators([Validators.required]);
      }
      this.sendMessageForm.get('countryCode')?.updateValueAndValidity();
      this.sendMessageForm.get('phone')?.updateValueAndValidity();
      this.sendMessageForm.get('clientId')?.updateValueAndValidity();
    });

    this.sendMessageForm.get('clientId')?.valueChanges.subscribe((clientId) => {
      if (clientId) {
        const client = this.clients.find((c) => String(c.id) === String(clientId));
        if (client) {
          const phone = client.phone;
          const countryCode =
            this.countryCodes.find((code) => phone.startsWith(code.code))
              ?.code || '+20';
          const phoneNumber = phone.replace(countryCode, '');
          this.sendMessageForm.patchValue({
            countryCode,
            phone: phoneNumber,
          });
        }
      }
    });
  }

  setActiveTab(tab: 'single' | 'broadcast' | 'schedules'): void {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
  }

  sendMessage(): void {
    if (this.walletPoints <= 0) {
      this.errorMessage = 'You do not have enough points to send messages.';
      return;
    }

    if (this.sendMessageForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isSendingMessage = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { inputType, countryCode, phone, clientId, message } =
      this.sendMessageForm.value;
    let fullPhone: string;

    if (inputType === 'manual') {
      fullPhone = `${countryCode}${phone}`;
    } else {
      const client = this.clients.find((c) => String(c.id) === String(clientId));
      fullPhone = client?.phone || '';
    }

    this.sendMessageService.sendMessage(fullPhone, message).subscribe({
      next: (response) => {
        console.log('Message sent:', response);
        this.sendMessageForm.reset({ inputType: 'manual', countryCode: '+20' });
        this.successMessage = response.message || 'Message sent successfully';
        if (typeof response.remainingPoints === 'number') {
          this.walletPoints = response.remainingPoints;
          this.authService.updateWalletPoints(response.remainingPoints);
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.errorMessage = error.message || 'Failed to send message';
        this.isSendingMessage = false;
      },
      complete: () => {
        this.isSendingMessage = false;
      },
    });
  }

  sendBroadcast(): void {
    if (this.walletPoints <= 0) {
      this.errorMessage = 'You do not have enough points to send messages.';
      return;
    }

    if (this.broadcastForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isSendingBroadcast = true;
    this.errorMessage = null;
    this.successMessage = null;

    const {
      phoneNumbers,
      messagePool,
      batchSize,
      intervalMs,
      repeatIntervalMs,
      repeatCount,
    } = this.broadcastForm.value;
    const phones = phoneNumbers
      .split('\n')
      .map((phone: string) => phone.trim())
      .filter((phone: string) => phone);
    const messages = messagePool
      .split('\n')
      .map((msg: string) => msg.trim())
      .filter((msg: string) => msg);

    if (phones.length === 0 || messages.length === 0) {
      this.errorMessage =
        'Please enter at least one valid phone number and one valid message';
      this.isSendingBroadcast = false;
      return;
    }

    if (phones.length > this.walletPoints) {
      this.errorMessage = `You need ${phones.length} points for this broadcast. Available: ${this.walletPoints}.`;
      this.isSendingBroadcast = false;
      return;
    }

    this.sendMessageService
      .sendRandomMessages(
        messages,
        phones,
        batchSize,
        intervalMs,
        repeatIntervalMs,
        repeatCount
      )
      .subscribe({
        next: (response) => {
          console.log('Broadcast initiated:', response);
          this.broadcastForm.reset({
            phoneNumbers: '',
            messagePool: '',
            batchSize: 10,
            intervalMs: 5000,
            repeatIntervalMs: 0,
            repeatCount: 0,
          });
          this.successMessage = response.scheduleId
            ? `Scheduled messages initiated. Schedule ID: ${response.scheduleId}. Total phone numbers: ${response.total}`
            : `Broadcast initiated. Total phone numbers: ${response.total}, Batch size: ${response.batchSize}, Interval: ${response.intervalMs}ms`;
          if (typeof response.remainingPoints === 'number') {
            this.walletPoints = response.remainingPoints;
            this.authService.updateWalletPoints(response.remainingPoints);
          }
          this.loadSchedules(); // Refresh schedules list
        },
        error: (error) => {
          console.error('Error initiating broadcast:', error);
          this.errorMessage = error.message || 'Failed to initiate broadcast';
          this.isSendingBroadcast = false;
        },
        complete: () => {
          this.isSendingBroadcast = false;
        },
      });
  }

  toggleSchedule(scheduleId: string, action: 'pause' | 'resume'): void {
    this.sendMessageService.toggleSchedule(scheduleId, action).subscribe({
      next: (response) => {
        console.log(`${action} schedule:`, response);
        this.successMessage =
          response.message || `Schedule ${action}d successfully`;
        this.loadSchedules(); // Refresh schedules list
      },
      error: (error) => {
        console.error(`Error ${action} schedule:`, error);
        this.errorMessage = error.message || `Failed to ${action} schedule`;
      },
    });
  }
}
