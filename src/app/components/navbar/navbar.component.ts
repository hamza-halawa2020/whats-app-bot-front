// @ts-nocheck
import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginComponent } from '../login/login.component.js';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    LoginComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  activeMenu: { [key: string]: { [key: string]: boolean } } = {};
  windowWidth: number = window.innerWidth;
  toggle: boolean = false;
  activeTab: number = 1;
  isAuthenticated$: Observable<boolean>;

  @Input() transparent:any

  scroll: boolean = false;
  current: string = '';

  constructor(private router: Router, private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$();
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.current = this.router.url;

    const handlerScroll = () => {
      this.scroll = window.scrollY > 50;
    };

    const handleResize = () => {
      this.windowWidth = window.innerWidth;
    };
    window.addEventListener('scroll', handlerScroll);
    window.addEventListener('resize', handleResize);

  }

  handleMouseEnter(menu: string, submenu?: string): void {
    if (!this.activeMenu[menu]) this.activeMenu[menu] = {};
    this.activeMenu[menu][submenu || 'main'] = true;
  }

  handleMouseLeave(menu: string, submenu?: string): void {
    if (this.activeMenu[menu]) this.activeMenu[menu][submenu || 'main'] = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}




