import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

export interface AppUser {
  id: string | number;
  email?: string;
  phone?: string;
  name?: string;
  username?: string;
  role?: 'admin' | 'user';
  walletPoints?: number;
}

interface LoginResponse {
  token: string;
  user: AppUser;
  message: string;
  success?: boolean;
}

interface RegisterResponse {
  message: string;
  user: AppUser;
}

interface MeResponse {
  success: boolean;
  user: AppUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'token';
  private userKey = 'currentUser';
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  private currentUserSubject: BehaviorSubject<AppUser | null>;
  public currentUser$: Observable<AppUser | null>;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    this.currentUserSubject = new BehaviorSubject<AppUser | null>(this.getUser());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  // Get authentication status as observable
  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Login method
  login(credentials: { phone?: string; email?: string; password?: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            if (response.user) {
              this.setUser(response.user);
            }
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  // Signup method (added to match local service)
  signup(credentials: { email: string; username: string; password?: string; phone: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/signup`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            if (response.user) {
              this.setUser(response.user);
            }
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  // Register method
  register(userData: { phone: string; name?: string; email?: string; password?: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, userData);
  }

  refreshMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`).pipe(
      tap(response => {
        if (response.user) {
          this.setUser(response.user);
        }
      })
    );
  }

  // Logout method
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.isAuthenticatedSubject.next(false);
  }

  // Get stored token
  getToken(): string | null {
    return this.cookieService.get(this.tokenKey) || null;
  }

  // Get stored user
  getUser(): any {
    const user = this.cookieService.get(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }

  updateWalletPoints(walletPoints: number): void {
    const user = this.getUser();
    if (!user) {
      return;
    }

    this.setUser({ ...user, walletPoints });
  }

  // Private methods
  private hasToken(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    this.cookieService.set(this.tokenKey, token, {
      expires: 7,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict',
    });
  }

  private setUser(user: any): void {
    this.cookieService.set(this.userKey, JSON.stringify(user), {
      expires: 7,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict',
    });
    this.currentUserSubject.next(user);
  }

  private removeToken(): void {
    this.cookieService.delete(this.tokenKey, '/');
  }

  private removeUser(): void {
    this.cookieService.delete(this.userKey, '/');
    this.currentUserSubject.next(null);
  }
}
