import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoginComponent } from '../../components/login/login.component';
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
    LoginComponent,

  ],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
})
export class CreateAccountComponent implements OnInit {
  signupForm: FormGroup;
  loginForm: FormGroup;
  signupError: string | null = null;
  loginError: string | null = null;
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  isLoginMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    });

    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      password: [''],
    });
  }

  ngOnInit(): void {}

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.signupError = null;
    this.loginError = null;
  }

  async onSignup(): Promise<void> {
    if (this.isSubmitting || this.signupForm.invalid) {
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
        this.signupForm.reset();
        // After successful registration, switch to login mode
        this.isLoginMode = true;
        this.loginForm.patchValue({ phone });
      }
    } catch (error: any) {
      this.signupError = error.error?.error || 'Failed to create account';
      console.error('Signup error:', error);
    } finally {
      this.isSubmitting = false;
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
    console.log('Login attempt:', { phone });

    try {
      const result = await this.authService.login({ phone, password }).toPromise();
      console.log('Login result:', result);

      if (result && result.token) {
        this.loginError = null;
        this.loginForm.reset();
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      this.loginError = error.error?.error || 'Failed to login';
      console.error('Login error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Method to open login modal
  openLoginModal(): void {
    const modalElement = document.getElementById('login');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}