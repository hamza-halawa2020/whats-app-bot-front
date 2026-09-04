import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AppUser } from '../../services/auth.service';
import {
  AdminAnalytics,
  AppSettings,
  PointPackage,
  PointPurchase,
  WalletService,
} from '../../services/wallet.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  activeSection: 'payments' | 'users' | 'packages' | 'settings' = 'payments';
  users: AppUser[] = [];
  packages: PointPackage[] = [];
  purchases: PointPurchase[] = [];
  selectedUser: AppUser | null = null;
  editingUser: AppUser | null = null;
  editingPackage: PointPackage | null = null;
  points = 1;
  note = '';
  action: 'credit' | 'debit' = 'credit';
  isLoading = false;
  isSavingSettings = false;
  isSavingPackage = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  purchaseStatusFilter = 'pending';
  usersPage = 1;
  usersLimit = 10;
  usersTotal = 0;
  usersTotalPages = 1;
  packagesPage = 1;
  packagesLimit = 10;
  packagesTotal = 0;
  packagesTotalPages = 1;
  purchasesPage = 1;
  purchasesLimit = 10;
  purchasesTotal = 0;
  purchasesTotalPages = 1;
  reviewNotes: Record<number, string> = {};
  analytics: AdminAnalytics = {
    totalUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0,
    pendingPayments: 0,
    activePackages: 0,
    walletPoints: 0,
  };
  settingsForm: AppSettings = {
    signupGiftPoints: 0,
    messagePointCost: 1,
    dailyMessageLimit: 0,
    pointUnitPrice: 1,
    pointCurrency: 'EGP',
  };
  packageForm = {
    name: '',
    points: 1,
    price: 1,
    currency: 'EGP',
    isActive: true,
  };
  createUserForm = {
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    walletPoints: 0,
    isVerified: true,
  };
  editUserForm = {
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    isVerified: true,
  };

  constructor(private walletService: WalletService) {}

  get pendingPurchasesCount(): number {
    return this.analytics.pendingPayments;
  }

  get totalWalletPoints(): number {
    return this.analytics.walletPoints;
  }

  get activePackagesCount(): number {
    return this.analytics.activePackages;
  }

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadUsers();
    this.loadSettings();
    this.loadPackages();
    this.loadPurchases();
  }

  setSection(section: 'payments' | 'users' | 'packages' | 'settings'): void {
    this.activeSection = section;
    this.errorMessage = null;
    this.successMessage = null;
  }

  refreshActiveSection(): void {
    this.loadAnalytics();

    if (this.activeSection === 'payments') {
      this.loadPurchases(this.purchasesPage);
      return;
    }

    if (this.activeSection === 'users') {
      this.loadUsers(this.usersPage);
      return;
    }

    if (this.activeSection === 'packages') {
      this.loadPackages(this.packagesPage);
      return;
    }

    this.loadSettings();
  }

  loadAnalytics(): void {
    this.walletService.getAdminAnalytics().subscribe({
      next: (response) => {
        this.analytics = response.analytics;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load analytics';
      },
    });
  }

  loadSettings(): void {
    this.walletService.getAdminSettings().subscribe({
      next: (response) => {
        this.settingsForm = {
          ...response.settings,
          pointCurrency: this.normalizeCurrency(response.settings.pointCurrency),
        };
        this.syncPackageCurrencyWithSettings();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load settings';
      },
    });
  }

  saveSettings(): void {
    if (
      this.settingsForm.signupGiftPoints < 0 ||
      this.settingsForm.messagePointCost < 1 ||
      this.settingsForm.dailyMessageLimit < 0
      || this.settingsForm.pointUnitPrice <= 0
      || !this.settingsForm.pointCurrency
    ) {
      this.errorMessage = 'Check settings values';
      return;
    }

    this.isSavingSettings = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      ...this.settingsForm,
      pointCurrency: this.normalizeCurrency(this.settingsForm.pointCurrency),
    };

    this.walletService.updateAdminSettings(payload).subscribe({
      next: (response) => {
        this.settingsForm = {
          ...response.settings,
          pointCurrency: this.normalizeCurrency(response.settings.pointCurrency),
        };
        this.syncPackageCurrencyWithSettings(true);
        this.successMessage = response.message;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to save settings';
      },
      complete: () => {
        this.isSavingSettings = false;
      },
    });
  }

  loadUsers(page = 1): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.walletService.getAdminUsers(page, this.usersLimit).subscribe({
      next: (response) => {
        const receivedUsers = response.users || [];
        const apiReturnedMoreThanOnePage = receivedUsers.length > this.usersLimit;
        this.users = apiReturnedMoreThanOnePage
          ? receivedUsers.slice((page - 1) * this.usersLimit, page * this.usersLimit)
          : receivedUsers;
        this.usersPage = apiReturnedMoreThanOnePage ? page : response.page || page;
        this.usersTotal = response.total || receivedUsers.length;
        this.usersTotalPages = Math.max(
          apiReturnedMoreThanOnePage
            ? Math.ceil(this.usersTotal / this.usersLimit)
            : response.totalPages || Math.ceil(this.usersTotal / this.usersLimit) || 1,
          1
        );
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load users';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  loadPackages(page = 1): void {
    this.walletService.getAdminPointPackages(page, this.packagesLimit).subscribe({
      next: (response) => {
        this.packages = response.packages || [];
        this.packagesPage = response.page || page;
        this.packagesTotal = response.total || this.packages.length;
        this.packagesTotalPages = Math.max(response.totalPages || 1, 1);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load packages';
      },
    });
  }

  savePackage(): void {
    this.packageForm.currency = this.normalizeCurrency(this.packageForm.currency || this.settingsForm.pointCurrency);

    if (
      !this.packageForm.name ||
      this.packageForm.points <= 0 ||
      this.packageForm.price <= 0 ||
      !this.packageForm.currency
    ) {
      this.errorMessage = 'Fill package name, points, and price';
      return;
    }

    this.isSavingPackage = true;
    this.errorMessage = null;
    this.successMessage = null;
    const payload = {
      ...this.packageForm,
      currency: this.packageForm.currency,
    };
    const request = this.editingPackage
      ? this.walletService.updateAdminPointPackage(this.editingPackage.id, payload)
      : this.walletService.createAdminPointPackage(payload);

    request.subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.cancelPackageEdit();
        this.loadPackages(this.packagesPage);
        this.loadAnalytics();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to save package';
      },
      complete: () => {
        this.isSavingPackage = false;
      },
    });
  }

  editPackage(pointPackage: PointPackage): void {
    this.editingPackage = pointPackage;
    this.packageForm = {
      name: pointPackage.name,
      points: Number(pointPackage.points),
      price: Number(pointPackage.price),
      currency: this.normalizeCurrency(pointPackage.currency),
      isActive: Boolean(pointPackage.isActive),
    };
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelPackageEdit(): void {
    this.editingPackage = null;
    this.packageForm = {
      name: '',
      points: 1,
      price: 1,
      currency: this.normalizeCurrency(this.settingsForm.pointCurrency),
      isActive: true,
    };
  }

  loadPurchases(page = 1): void {
    this.walletService.getAdminPointPurchases(
      this.purchaseStatusFilter,
      page,
      this.purchasesLimit
    ).subscribe({
      next: (response) => {
        this.purchases = response.purchases || [];
        this.purchasesPage = response.page || page;
        this.purchasesTotal = response.total || this.purchases.length;
        this.purchasesTotalPages = Math.max(response.totalPages || 1, 1);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load payment requests';
      },
    });
  }

  reviewPurchase(purchase: PointPurchase, status: 'approved' | 'refused' | 'canceled'): void {
    const adminNote = this.reviewNotes[purchase.id] || '';
    if (status === 'refused' && !adminNote.trim()) {
      this.errorMessage = 'Add a note before refusing a payment';
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;

    this.walletService.reviewPointPurchase(purchase.id, { status, adminNote }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        delete this.reviewNotes[purchase.id];
        this.loadPurchases(this.purchasesPage);
        this.loadUsers(this.usersPage);
        this.loadAnalytics();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to review payment';
      },
    });
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

  openWalletAction(user: AppUser, action: 'credit' | 'debit'): void {
    this.selectedUser = user;
    this.action = action;
    this.points = 1;
    this.note = '';
    this.errorMessage = null;
    this.successMessage = null;
  }

  submitWalletAction(): void {
    if (!this.selectedUser || this.points <= 0) {
      this.errorMessage = 'Enter a valid points value';
      return;
    }

    const request =
      this.action === 'credit'
        ? this.walletService.creditUser(this.selectedUser.id, this.points, this.note)
        : this.walletService.debitUser(this.selectedUser.id, this.points, this.note);

    request.subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.selectedUser = null;
        this.loadUsers(this.usersPage);
        this.loadAnalytics();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Wallet action failed';
      },
    });
  }

  createUser(): void {
    if (
      !this.createUserForm.username ||
      !this.createUserForm.email ||
      !this.createUserForm.phone ||
      !this.createUserForm.password
    ) {
      this.errorMessage = 'Fill all user fields';
      return;
    }

    this.walletService.createUser(this.createUserForm).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.createUserForm = {
          username: '',
          email: '',
          phone: '',
          password: '',
          role: 'user',
          walletPoints: 0,
          isVerified: true,
        };
        this.loadUsers(1);
        this.loadAnalytics();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to create user';
      },
    });
  }

  openEditUser(user: AppUser): void {
    this.editingUser = user;
    this.editUserForm = {
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'user',
      isVerified: Boolean(user.isVerified),
    };
    this.errorMessage = null;
    this.successMessage = null;
  }

  updateUser(): void {
    if (!this.editingUser) {
      return;
    }

    const payload: any = {
      username: this.editUserForm.username,
      email: this.editUserForm.email,
      phone: this.editUserForm.phone,
      role: this.editUserForm.role,
      isVerified: this.editUserForm.isVerified,
    };

    if (this.editUserForm.password) {
      payload.password = this.editUserForm.password;
    }

    this.walletService.updateUser(this.editingUser.id, payload).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.editingUser = null;
        this.loadUsers(this.usersPage);
        this.loadAnalytics();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to update user';
      },
    });
  }

  changeUsersPage(delta: number): void {
    const nextPage = this.usersPage + delta;
    if (nextPage < 1 || nextPage > this.usersTotalPages) {
      return;
    }

    this.loadUsers(nextPage);
  }

  changePackagesPage(delta: number): void {
    const nextPage = this.packagesPage + delta;
    if (nextPage < 1 || nextPage > this.packagesTotalPages) {
      return;
    }

    this.loadPackages(nextPage);
  }

  changePurchasesPage(delta: number): void {
    const nextPage = this.purchasesPage + delta;
    if (nextPage < 1 || nextPage > this.purchasesTotalPages) {
      return;
    }

    this.loadPurchases(nextPage);
  }

  onPurchaseStatusChange(): void {
    this.purchasesPage = 1;
    this.loadPurchases(1);
  }

  private normalizeCurrency(value: string | null | undefined): string {
    return String(value || 'EGP').trim().toUpperCase();
  }

  private syncPackageCurrencyWithSettings(force = false): void {
    if (this.editingPackage) {
      return;
    }

    if (force || !this.packageForm.currency || this.packageForm.currency === 'EGP') {
      this.packageForm.currency = this.normalizeCurrency(this.settingsForm.pointCurrency);
    }
  }
}
