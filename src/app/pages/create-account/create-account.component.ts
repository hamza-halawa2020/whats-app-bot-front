import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { CountryCodeSelectComponent } from '../../components/country-code-select/country-code-select.component';

declare var bootstrap: any;

@Component({
  selector: 'app-create-account',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    CountryCodeSelectComponent,

  ],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
})
export class CreateAccountComponent {
  signupForm: FormGroup;
  otpForm: FormGroup;
  signupError: string | null = null;
  signupSuccess: string | null = null;
  isSubmitting: boolean = false;
  isVerifying: boolean = false;
  isResending: boolean = false;
  pendingPhone: string | null = null;
  pendingCountryCode: string | null = null;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      countryCode: ['EG', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s-]{6,20}$/)]],
    });
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  async onSignup(): Promise<void> {
    if (this.isSubmitting || this.signupForm.invalid) {
      this.signupSuccess = null;
      this.signupError = this.signupForm.invalid
        ? 'Please fill in all required fields correctly'
        : null;
      return;
    }

    this.isSubmitting = true;
    const { name, password, phone, countryCode } = this.signupForm.value;

    try {
      const result = await this.authService.register({ name, password, phone, countryCode }).toPromise();

      if (result) {
        this.signupError = null;
        this.pendingPhone = phone;
        this.pendingCountryCode = countryCode;
        this.signupSuccess = result.otpDebugCode
          ? `OTP sent to your WhatsApp. Test code: ${result.otpDebugCode}`
          : 'OTP sent to your WhatsApp.';
      }
    } catch (error: any) {
      this.signupSuccess = null;
      this.signupError = error.error?.error || 'Failed to create account';
      console.error('Signup error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async onVerifyOtp(): Promise<void> {
    if (this.isVerifying || this.otpForm.invalid || !this.pendingPhone) {
      this.signupError = this.otpForm.invalid
        ? 'Enter the 6-digit OTP sent to your WhatsApp'
        : null;
      return;
    }

    this.isVerifying = true;
    this.signupError = null;

    try {
      const result = await this.authService.verifyOtp({
        phone: this.pendingPhone,
        countryCode: this.pendingCountryCode || undefined,
        code: this.otpForm.value.code,
      }).toPromise();

      if (result) {
        this.signupSuccess = 'Account verified successfully. You can sign in now.';
        this.signupForm.reset();
        this.otpForm.reset();
        this.pendingPhone = null;
        this.pendingCountryCode = null;
      }
    } catch (error: any) {
      this.signupSuccess = null;
      this.signupError = error.error?.error || 'Invalid verification code';
    } finally {
      this.isVerifying = false;
    }
  }

  async resendOtp(): Promise<void> {
    if (this.isResending || !this.pendingPhone) {
      return;
    }

    this.isResending = true;
    this.signupError = null;

    try {
      const result = await this.authService.resendOtp({
        phone: this.pendingPhone,
        countryCode: this.pendingCountryCode || undefined,
      }).toPromise();
      this.signupSuccess = result?.otpDebugCode
        ? `New OTP sent to your WhatsApp. Test code: ${result.otpDebugCode}`
        : 'New OTP sent to your WhatsApp.';
    } catch (error: any) {
      this.signupSuccess = null;
      this.signupError = error.error?.error || 'Failed to resend OTP';
    } finally {
      this.isResending = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  openLoginModal(): void {
    const modalElement = document.getElementById('login');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

}
