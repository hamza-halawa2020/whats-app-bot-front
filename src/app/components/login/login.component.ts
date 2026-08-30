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

declare var bootstrap: any;

@Component({
  selector: 'app-login',

  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loginError: string | null = null;
  isSubmitting: boolean = false;
  showPassword: boolean = false; // Track password visibility

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    // Clean up any remaining modal artifacts
    this.cleanupModal();
  }

  // Method to close modal and navigate to register page
  navigateToRegister(): void {
    this.closeModal();
    setTimeout(() => {
      // Check if we're already on the create-account page
      if (this.router.url === '/create-account') {
        // Just close the modal, don't navigate
        return;
      }
      this.router.navigate(['/create-account']);
    }, 300); // Small delay to ensure modal is fully closed
  }

  // Method to close the modal properly
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

  // Clean up modal artifacts
  private cleanupModal(): void {
    // Remove any remaining backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Reset any inline styles that might interfere
    document.body.removeAttribute('style');
  }

  async onLogin(): Promise<void> {
    if (this.isSubmitting || this.loginForm.invalid) {
      this.loginError = this.loginForm.invalid
        ? 'Please fill in all required fields correctly'
        : null;
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.loginForm.value;
    console.log('Login attempt:', email, password);

    this.authService.login({ email, password }).subscribe({
      next: (result) => {
        console.log('Login result:', result);
        this.loginError = null;
        this.loginForm.reset();
        this.closeModal();
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        this.loginError = error.error?.error || 'Invalid email or password';
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
}
