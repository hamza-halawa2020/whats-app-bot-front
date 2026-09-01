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
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,20}$/)]],
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
        this.loginForm.reset();
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
}
