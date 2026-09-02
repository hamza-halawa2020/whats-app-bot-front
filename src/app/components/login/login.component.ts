import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CountryCodeSelectComponent } from '../country-code-select/country-code-select.component';

declare var bootstrap: any;

@Component({
  selector: 'app-login',

  imports: [ReactiveFormsModule, CommonModule, CountryCodeSelectComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  forgotForm: FormGroup;
  resetPasswordForm: FormGroup;
  loginError: string | null = null;
  loginSuccess: string | null = null;
  isSubmitting: boolean = false;
  isSendingResetOtp: boolean = false;
  isResettingPassword: boolean = false;
  showPassword: boolean = false;
  showResetPassword: boolean = false;
  authMode: 'login' | 'forgot' | 'reset' = 'login';
  pendingResetPhone: string | null = null;
  pendingResetCountryCode: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.forgotForm = this.fb.group({
      countryCode: ['EG', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s-]{6,20}$/)]],
    });

    this.resetPasswordForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.cleanupModal();
  }

  navigateToRegister(): void {
    this.closeModal();
    setTimeout(() => {
      if (this.router.url === '/create-account') {
        return;
      }
      this.router.navigate(['/create-account']);
    }, 300);
  }

  private closeModal(): void {
    const modalElement = document.getElementById('login');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.cleanupModal();
  }

  private cleanupModal(): void {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    document.body.removeAttribute('style');
  }

  setAuthMode(mode: 'login' | 'forgot' | 'reset', clearMessages = true): void {
    this.authMode = mode;
    if (clearMessages) {
      this.loginError = null;
      this.loginSuccess = null;
    }
  }

  async onLogin(): Promise<void> {
    if (this.isSubmitting || this.loginForm.invalid) {
      this.loginError = this.loginForm.invalid
        ? 'Please fill in all required fields correctly'
        : null;
      return;
    }

    this.isSubmitting = true;
    const { phone, password } = this.loginForm.value;

    this.authService.login({ phone, password }).subscribe({
      next: (result) => {
        this.loginError = null;
        this.loginSuccess = null;
        this.loginForm.reset();
        this.setAuthMode('login', false);
        this.closeModal();
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        this.loginError = error.error?.error || 'Invalid phone or password';
        console.error('Login error:', error);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleResetPasswordVisibility(): void {
    this.showResetPassword = !this.showResetPassword;
  }

  requestPasswordReset(): void {
    if (this.isSendingResetOtp || this.forgotForm.invalid) {
      this.loginError = this.forgotForm.invalid
        ? 'Enter your WhatsApp phone correctly'
        : null;
      return;
    }

    this.isSendingResetOtp = true;
    this.loginError = null;
    this.loginSuccess = null;
    const { phone, countryCode } = this.forgotForm.value;

    this.authService.forgotPassword({ phone, countryCode }).subscribe({
      next: (response) => {
        this.pendingResetPhone = phone;
        this.pendingResetCountryCode = countryCode;
        this.loginSuccess = response.otpDebugCode
          ? `Reset code sent. Test code: ${response.otpDebugCode}`
          : response.message;
        this.setAuthMode('reset', false);
      },
      error: (error) => {
        this.loginError = error.error?.error || 'Failed to send reset code';
      },
      complete: () => {
        this.isSendingResetOtp = false;
      },
    });
  }

  resetPassword(): void {
    if (
      this.isResettingPassword ||
      this.resetPasswordForm.invalid ||
      !this.pendingResetPhone
    ) {
      this.loginError = this.resetPasswordForm.invalid
        ? 'Enter the code and a new password'
        : null;
      return;
    }

    this.isResettingPassword = true;
    this.loginError = null;
    const { code, password } = this.resetPasswordForm.value;

    this.authService.resetPassword({
      phone: this.pendingResetPhone,
      countryCode: this.pendingResetCountryCode || undefined,
      code,
      password,
    }).subscribe({
      next: (response) => {
        this.resetPasswordForm.reset();
        this.pendingResetPhone = null;
        this.pendingResetCountryCode = null;
        this.setAuthMode('login', false);
        this.loginSuccess = response.message;
      },
      error: (error) => {
        this.loginSuccess = null;
        this.loginError = error.error?.error || 'Failed to reset password';
      },
      complete: () => {
        this.isResettingPassword = false;
      },
    });
  }
}
