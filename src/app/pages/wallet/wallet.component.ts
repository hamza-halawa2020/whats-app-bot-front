import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { WalletService, WalletTransaction } from '../../services/wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent implements OnInit {
  walletPoints = 0;
  transactions: WalletTransaction[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private walletService: WalletService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.walletService.getWallet().subscribe({
      next: (response) => {
        this.walletPoints = response.wallet.walletPoints;
        this.transactions = response.transactions || [];
        this.authService.updateWalletPoints(this.walletPoints);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load wallet';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
