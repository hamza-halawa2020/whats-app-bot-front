import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { IAuthService } from './auth.interface';

interface ApiResponse {
  user?: { email: string };
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements IAuthService {
  private currentUserSubject = new BehaviorSubject<{ email: string } | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    const storedUser = this.cookieService.get('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: { email: string } }> {
    console.log('Sending login request:', { email, password });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<ApiResponse>(
        `${environment.apiUrl}/auth/login`,
        { email, password },
        { headers }
      )
      .pipe(
        map(response => {
          console.log('API response:', response);
          if (response.user && response.token) {
            this.cookieService.set('currentUser', JSON.stringify(response.user), {
              expires: 7,
              path: '/',
              secure: window.location.protocol === 'https:',
              sameSite: 'Strict',
            });
            this.cookieService.set('token', response.token, {
              expires: 7,
              path: '/',
              secure: window.location.protocol === 'https:',
              sameSite: 'Strict',
            });
            this.currentUserSubject.next(response.user);
            return { success: true, user: response.user };
          } else {
            return { success: false, message: response.message || 'Invalid email or password' };
          }
        }),
        catchError(this.handleError)
      )
      .toPromise() as Promise<{ success: boolean; message?: string; user?: { email: string } }>;
  }

  signup(email: string, username: string, password: string, phone: string): Promise<{ success: boolean; message?: string; user?: { email: string } }> {
    console.log('Sending signup request:', { email, username, password, phone });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<ApiResponse>(
        `${environment.apiUrl}/auth/signup`,
        { email, username, password, phone },
        { headers }
      )
      .pipe(
        map(response => {
          console.log('API response:', response);
          if (response.user && response.token) {
            this.cookieService.set('currentUser', JSON.stringify(response.user), {
              expires: 7,
              path: '/',
              secure: window.location.protocol === 'https:',
              sameSite: 'Strict',
            });
            this.cookieService.set('token', response.token, {
              expires: 7,
              path: '/',
              secure: window.location.protocol === 'https:',
              sameSite: 'Strict',
            });
            this.currentUserSubject.next(response.user);
            return { success: true, user: response.user };
          } else {
            return { success: false, message: response.message || 'Failed to create account' };
          }
        }),
        catchError(this.handleError)
      )
      .toPromise() as Promise<{ success: boolean; message?: string; user?: { email: string } }>;
  }

  isAuthenticated(): boolean {
    return !!this.cookieService.get('token');
  }

  logout(): void {
    this.cookieService.delete('currentUser', '/');
    this.cookieService.delete('token', '/');
    this.currentUserSubject.next(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 400) {
      errorMessage = error.error.message || 'Bad request';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check CORS settings or server availability.';
    }
    console.error('API error:', error);
    return throwError(() => new Error(errorMessage));
  }
}