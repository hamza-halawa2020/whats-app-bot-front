import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginComponent } from '../login/login.component.js';
import { AppUser, AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LoginComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<AppUser | null>;

  constructor(private router: Router, private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$();
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
