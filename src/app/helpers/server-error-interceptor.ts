import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpRequest, HttpHandler,
    HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { MessageService } from '../services/message.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
    constructor(private messageService: MessageService){

    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(
            retry(1),
            catchError((error: HttpErrorResponse) => {

                const message = [
                    'Message: ' + error.message,
                    'Name: ' + error.name,
                    'Status: ' + error.status,
                    'Status Text: ' + error.statusText,
                  ].join('\n');

                this.messageService.add(message,'error');
                return throwError(error);
            })
        );
    }
}