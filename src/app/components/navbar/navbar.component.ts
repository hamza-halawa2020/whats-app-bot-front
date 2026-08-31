import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginComponent } from '../login/login.component.js';
import { AuthService } from '../../services/auth.service';
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

  constructor(private router: Router, private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
