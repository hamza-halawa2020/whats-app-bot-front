import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private cookieService: CookieService,
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let token = this.authService.getToken();
    if (!token) {
      token = this.cookieService.get('token');
    }

    const authRequest = token ? this.addAuthorizationHeader(request, token) : request;

    if (request.url.includes('/auth/refresh-token')) {
      return next.handle(authRequest);
    }

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401 || !this.authService.getRefreshToken()) {
          return throwError(() => error);
        }

        return this.authService.refreshAuthToken().pipe(
          switchMap((response) => {
            const refreshedRequest = this.addAuthorizationHeader(request, response.token);
            return next.handle(refreshedRequest);
          }),
          catchError((refreshError) => {
            this.authService.logout();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }

  private addAuthorizationHeader(
    request: HttpRequest<unknown>,
    token: string
  ): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
