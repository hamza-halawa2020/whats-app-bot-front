import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import {
  AppSettings,
  PointPackage,
  PointPurchase,
  WalletService,
  WalletTransaction,
} from '../../services/wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent implements OnInit {
  private readonly maxProofFileBytes = 15 * 1024 * 1024;
  @ViewChild('packageSlider') packageSlider?: ElementRef<HTMLDivElement>;
  activeSection: 'buy' | 'payments' | 'activity' = 'buy';
  walletPoints = 0;
  transactions: WalletTransaction[] = [];
  packages: PointPackage[] = [];
  purchases: PointPurchase[] = [];
  isLoading = false;
  isBuying = false;
  isReadingFile = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  settings: AppSettings = {
    signupGiftPoints: 0,
    messagePointCost: 1,
    dailyMessageLimit: 0,
    pointUnitPrice: 1,
    pointCurrency: 'EGP',
  };
  purchaseForm = {
    packageId: null as number | null,
    points: 1,
    paymentMethod: 'manual' as 'manual' | 'automatic',
    proofReference: '',
    proofFile: null as { name: string; type: string; data: string } | null,
    userNote: '',
  };
  editingPurchase: PointPurchase | null = null;
  editPurchaseForm = {
    proofReference: '',
    proofFile: null as { name: string; type: string; data: string } | null,
    userNote: '',
  };

  constructor(
    private walletService: WalletService,
    private authService: AuthService
  ) {}

  get pendingPurchasesCount(): number {
    return this.purchases.filter((item) => item.status === 'pending').length;
  }

  get refusedPurchasesCount(): number {
    return this.purchases.filter((item) => item.status === 'refused').length;
  }

  ngOnInit(): void {
    this.loadWallet();
    this.loadPurchaseOptions();
    this.loadPurchases();
  }

  setSection(section: 'buy' | 'payments' | 'activity'): void {
    this.activeSection = section;
    this.errorMessage = null;
    this.successMessage = null;
  }

  refreshActiveSection(): void {
    if (this.activeSection === 'buy') {
      this.loadPurchaseOptions();
      return;
    }

    if (this.activeSection === 'payments') {
      this.loadPurchases();
      return;
    }

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

  loadPurchaseOptions(): void {
    this.walletService.getSettings().subscribe({
      next: (response) => {
        this.settings = {
          ...response.settings,
          pointCurrency: this.normalizeCurrency(response.settings.pointCurrency),
        };
      },
    });

    this.walletService.getPointPackages(1, 100).subscribe({
      next: (response) => {
        this.packages = (response.packages || [])
          .filter((pointPackage) => pointPackage.isActive)
          .map((pointPackage) => ({
            ...pointPackage,
            currency: this.normalizeCurrency(pointPackage.currency),
          }));

        const selectedPackageStillExists = this.packages.some(
          (item) => item.id === Number(this.purchaseForm.packageId)
        );

        if (this.packages.length > 0 && !selectedPackageStillExists) {
          this.purchaseForm.packageId = this.packages[0].id;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load point packages';
      },
    });
  }

  loadPurchases(): void {
    this.walletService.getPointPurchases().subscribe({
      next: (response) => {
        this.purchases = response.purchases || [];
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load payment requests';
      },
    });
  }

  get selectedPackage(): PointPackage | null {
    return this.packages.find((item) => item.id === Number(this.purchaseForm.packageId)) || null;
  }

  get selectedPackageIndex(): number {
    return this.packages.findIndex((item) => item.id === Number(this.purchaseForm.packageId));
  }

  get purchasePreview(): { points: number; amount: number; currency: string } {
    const pointPackage = this.selectedPackage;
    if (pointPackage) {
      return {
        points: Number(pointPackage.points),
        amount: Number(pointPackage.price),
        currency: this.normalizeCurrency(pointPackage.currency),
      };
    }

    const points = Math.max(Number(this.purchaseForm.points) || 0, 0);
    return {
      points,
      amount: Number((points * this.settings.pointUnitPrice).toFixed(2)),
      currency: this.normalizeCurrency(this.settings.pointCurrency),
    };
  }

  useCustomPoints(): void {
    this.purchaseForm.packageId = null;
  }

  selectPackage(pointPackage: PointPackage): void {
    this.purchaseForm.packageId = pointPackage.id;
  }

  selectPackageByIndex(index: number): void {
    const pointPackage = this.packages[index];
    if (!pointPackage) {
      return;
    }

    this.selectPackage(pointPackage);
    this.scrollPackageIntoView(index);
  }

  getPackageUnitPrice(pointPackage: PointPackage): number { 
    const price = Number(pointPackage.price) || 1;
    const points = Number(pointPackage.points) || 0;

    return Number((points / price).toFixed(2));
  }

  scrollPackages(direction: 'previous' | 'next'): void {
    const slider = this.packageSlider?.nativeElement;
    if (!slider) {
      return;
    }

    const cardWidth = slider.querySelector<HTMLElement>('.package-option')?.offsetWidth || 280;
    const gap = 16;
    slider.scrollBy({
      left: direction === 'next' ? cardWidth + gap : -(cardWidth + gap),
      behavior: 'smooth',
    });
  }

  private scrollPackageIntoView(index: number): void {
    const slider = this.packageSlider?.nativeElement;
    const packageCard = slider?.querySelectorAll<HTMLElement>('.package-option')[index];
    packageCard?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }

  submitPurchase(): void {
    const preview = this.purchasePreview;
    if (preview.points <= 0) {
      this.errorMessage = 'Choose a package or enter points';
      return;
    }

    if (this.purchaseForm.paymentMethod === 'manual' && !this.purchaseForm.proofFile) {
      this.errorMessage = 'Upload a payment proof file';
      return;
    }

    this.isBuying = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.walletService
      .createPointPurchase({
        packageId: this.purchaseForm.packageId,
        points: this.purchaseForm.packageId ? null : this.purchaseForm.points,
        paymentMethod: this.purchaseForm.paymentMethod,
        proofReference: this.purchaseForm.proofReference,
        proofFile: this.purchaseForm.proofFile,
        userNote: this.purchaseForm.userNote,
      })
      .subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.purchaseForm.proofReference = '';
          this.purchaseForm.proofFile = null;
          this.purchaseForm.userNote = '';
          this.loadPurchases();
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Failed to submit payment request';
        },
        complete: () => {
          this.isBuying = false;
        },
      });
  }

  openEditPurchase(purchase: PointPurchase): void {
    this.editingPurchase = purchase;
    this.editPurchaseForm = {
      proofReference: purchase.proofReference || '',
      proofFile: null,
      userNote: purchase.userNote || '',
    };
    this.errorMessage = null;
    this.successMessage = null;
  }

  updatePurchase(): void {
    if (!this.editingPurchase) {
      return;
    }

    this.walletService
      .updatePointPurchase(this.editingPurchase.id, this.editPurchaseForm)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.editingPurchase = null;
          this.loadPurchases();
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Failed to update payment request';
        },
      });
  }

  onProofFileSelected(event: Event, mode: 'create' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Upload a PDF, JPG, PNG, or WEBP file';
      input.value = '';
      return;
    }

    if (file.size > this.maxProofFileBytes) {
      this.errorMessage = 'Payment proof file must be 15 MB or less';
      input.value = '';
      return;
    }

    this.isReadingFile = true;
    this.errorMessage = null;
    const reader = new FileReader();
    reader.onload = () => {
      const proofFile = {
        name: file.name,
        type: file.type,
        data: String(reader.result || ''),
      };

      if (mode === 'create') {
        this.purchaseForm.proofFile = proofFile;
      } else {
        this.editPurchaseForm.proofFile = proofFile;
      }

      this.isReadingFile = false;
    };
    reader.onerror = () => {
      this.errorMessage = 'Failed to read selected file';
      this.isReadingFile = false;
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  openProof(purchase: PointPurchase): void {
    this.walletService.getPointPurchaseProof(purchase.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to open payment proof';
      },
    });
  }

  private normalizeCurrency(value: string | null | undefined): string {
    return String(value || 'EGP').trim().toUpperCase();
  }
}
