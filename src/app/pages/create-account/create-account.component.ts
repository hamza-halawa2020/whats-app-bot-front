import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-create-account',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,

  ],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
})
export class CreateAccountComponent {
  signupForm: FormGroup;
  signupError: string | null = null;
  signupSuccess: string | null = null;
  isSubmitting: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
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
    const { email, name, password, phone } = this.signupForm.value;
    console.log('Signup attempt:', { email, name, password, phone });

    try {
      const result = await this.authService.register({ email, name, password, phone }).toPromise();
      console.log('Signup result:', result);

      if (result) {
        this.signupError = null;
        this.signupSuccess = 'Account created successfully. Please wait for admin approval.';
        this.signupForm.reset();
      }
    } catch (error: any) {
      this.signupSuccess = null;
      this.signupError = error.error?.error || 'Failed to create account';
      console.error('Signup error:', error);
    } finally {
      this.isSubmitting = false;
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
