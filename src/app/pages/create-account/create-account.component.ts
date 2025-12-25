import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../components/login/auth.service';

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
export class CreateAccountComponent implements OnInit {
  signupForm: FormGroup;
  signupError: string | null = null;
  isSubmitting: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    });
  }

  ngOnInit(): void {}

  async onSignup(): Promise<void> {
    if (this.isSubmitting || this.signupForm.invalid) {
      this.signupError = this.signupForm.invalid
        ? 'Please fill in all required fields correctly'
        : null;
      return;
    }

    this.isSubmitting = true;
    const { email, username, password, phone } = this.signupForm.value;
    console.log('Signup attempt:', { email, username, password, phone });

    try {
      const result = await this.authService.signup(email, username, password, phone);
      console.log('Signup result:', result);

      if (result.success) {
        this.signupError = null;
        this.signupForm.reset();
        this.router.navigate(['/dashboard']);
      } else {
        this.signupError = result.message || 'Failed to create account';
      }
    } catch (error) {
      this.signupError = 'An unexpected error occurred';
      console.error('Signup error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}