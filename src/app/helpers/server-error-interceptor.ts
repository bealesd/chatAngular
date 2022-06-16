import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpRequest, HttpHandler,
    HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { MessageService } from '../services/message.service';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {

    constructor(
        private messageService: MessageService,
        private loginService: LoginService,
        public router: Router) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.loginService.jwtToken}`
            }
        });

        return next.handle(request).pipe(
            retry(1),
            catchError((response: HttpErrorResponse) => {
                const message = [
                    'Message: ' + response.message,
                    'Name: ' + response.name,
                    'Status: ' + response.status,
                    'Status Text: ' + response.statusText,
                ].join('\n');

                if (response.status < 200 || response.status >= 300) {
                    this.messageService.addNoAuth(message, 'error');
                    this.loginService.logout();
                    this.router.navigate(['login']);
                }
                else
                    this.messageService.add(message, 'error');

                return throwError(response);
            })
        );
    }
}