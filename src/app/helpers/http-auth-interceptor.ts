import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    const token = `${sessionStorage.getItem('username')}:${sessionStorage.getItem('password')}`;

    request = request.clone({
      setHeaders: {
        Authorization: `Basic ${btoa(token)}`
      }
    });

    return next.handle(request);
  }
}
