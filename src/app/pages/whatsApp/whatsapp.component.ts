import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { WhatsAppService } from './whatsApp.service';
import { QrCodeComponent } from '../qr-code/qr-code.component';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-whatsapp',
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    QrCodeComponent,
  ],
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.css'],
})
export class WhatsAppComponent implements OnInit, OnDestroy {
  qrCode: string | null = null;
  sessionStatus: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;
  private pollingSubscription: Subscription | null = null;

  constructor(private whatsappService: WhatsAppService) {}

  ngOnInit(): void {
    this.checkWhatsAppSession();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  checkWhatsAppSession(): void {
    this.whatsappService.startWhatsApp().subscribe(
      (response) => {
        console.log('WhatsApp session check:', response);
        this.qrCode = response.qrCode;
        this.sessionStatus = response.status || 'starting';
        this.errorMessage = null;
        if (this.sessionStatus === 'starting') {
          this.startPolling();
        }
      },
      (error) => {
        console.error('Error checking WhatsApp session:', error);
        this.errorMessage =
          error.error?.error || 'Failed to check WhatsApp session';
        this.stopPolling();
      }
    );
  }

  startWhatsApp(): void {
    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.whatsappService.startWhatsApp().subscribe(
      (response) => {
        this.qrCode = response.qrCode;
        this.sessionStatus = response.status || 'starting';
        this.successMessage = response.message;
        this.errorMessage = null;
        this.loading = false;
        if (this.sessionStatus === 'starting') {
          this.startPolling();
        }
      },
      (error) => {
        this.errorMessage = error.error?.error || 'Failed to start WhatsApp';
        this.successMessage = null;
        this.loading = false;
        this.stopPolling();
      }
    );
  }

  restartWhatsApp(): void {
    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.whatsappService.restartWhatsApp().subscribe(
      (response) => {
        console.log('WhatsApp restarted:', response);
        this.qrCode = response.qrCode;
        this.sessionStatus = response.status || 'starting';
        this.successMessage = response.message;
        this.errorMessage = null;
        this.loading = false;
        if (this.sessionStatus === 'starting') {
          this.startPolling();
        }
      },
      (error) => {
        console.error('Error restarting WhatsApp:', error);
        this.errorMessage = error.error?.error || 'Failed to restart WhatsApp';
        this.successMessage = null;
        this.loading = false;
        this.stopPolling();
      }
    );
  }

  deleteWhatsApp(): void {
    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.whatsappService.deleteWhatsApp().subscribe(
      (response) => {
        console.log('WhatsApp session deleted:', response);
        this.qrCode = null;
        this.sessionStatus = null;
        this.successMessage = response.message;
        this.errorMessage = null;
        this.loading = false;
        this.stopPolling();
      },
      (error) => {
        console.error('Error deleting WhatsApp session:', error);
        this.errorMessage =
          error.error?.error || 'Failed to delete WhatsApp session';
        this.successMessage = null;
        this.loading = false;
        this.stopPolling();
      }
    );
  }

  private startPolling(): void {
    this.stopPolling(); // Ensure no duplicate polling
    this.pollingSubscription = interval(5000) // Poll every 5 seconds
      .pipe(switchMap(() => this.whatsappService.startWhatsApp()))
      .subscribe(
        (response) => {
          this.qrCode = response.qrCode;
          this.sessionStatus = response.status || 'starting';
          if (this.sessionStatus === 'connected') {
            this.successMessage = 'WhatsApp session is now active!';
            this.stopPolling();
          }
        },
        (error) => {
          console.error('Error polling WhatsApp session:', error);
          this.errorMessage =
            error.error?.error || 'Failed to check WhatsApp session';
          this.stopPolling();
        }
      );
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }
}
