import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (!request.url.includes('/auth/login')) {

      const token = this.authService.getToken();

      console.log('JWT Token:', token);

      if (token) {

        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log(
          'Authorization Header:',
          request.headers.get('Authorization')
        );
      }
    }

    return next.handle(request);
  }
}