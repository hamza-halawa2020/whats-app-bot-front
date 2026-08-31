import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AppUser } from '../../services/auth.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  users: AppUser[] = [];
  selectedUser: AppUser | null = null;
  editingUser: AppUser | null = null;
  points = 1;
  note = '';
  action: 'credit' | 'debit' = 'credit';
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
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

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.walletService.getAdminUsers().subscribe({
      next: (response) => {
        this.users = response.users || [];
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to load users';
      },
      complete: () => {
        this.isLoading = false;
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
        this.loadUsers();
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
        this.loadUsers();
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
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to update user';
      },
    });
  }
}
