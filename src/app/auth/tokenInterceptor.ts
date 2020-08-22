import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private requestCount = 0;

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('github'))
      console.log(`gituhb requests: ${++this.requestCount}, at ${new Date().toLocaleTimeString()}.`);

    // let newHeaders = req.headers;
    // if(req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'OPTIONS'){
    //
    // }

    // let authReq = req.clone({ headers: newHeaders });


    return next.handle(req);
  }
}

// export class TokenInterceptorService implements HttpInterceptor {

//   // We inject a LoginService
//   constructor(private loginService: LoginService) { }
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     console.log('INTERCEPTOR');
//     // We retrieve the token, if any
//     const token = this.loginService.getAuthToken();
//     let newHeaders = req.headers;
//     if (token) {
//       // If we have a token, we append it to our new headers
//       newHeaders = newHeaders.append('authtoken', token);
//     }
//     // Finally we have to clone our request with our new headers
//     // This is required because HttpRequests are immutable
//     const authReq = req.clone({ headers: newHeaders });
//     // Then we return an Observable that will run the request
//     // or pass it to the next interceptor if any
//     return next.handle(authReq);
//   }
// }
