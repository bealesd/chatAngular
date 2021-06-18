import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoService } from '../services/crypto.service';

import { MessageService } from '../services/message.service';

@Injectable({
    providedIn: 'root'
})
export class RestHelper {
    constructor(
        private cryptoService: CryptoService,
        private messageService: MessageService,
        public router: Router
    ) { }



    options = (): { headers: HttpHeaders } => {
        const options = { headers: new HttpHeaders() };
        try {
            options.headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.cryptoService.getToken()}`
            });
        }
        catch (error) {
            this.messageService.add(`RestHelper: Getting token failed.`, 'error');
            this.router.navigate(['login']);
        }
        return options;
    }

    removeUrlParams = (rawUrl: string) =>
        new URL(rawUrl).origin + new URL(rawUrl).pathname;

    errorMessageHandler(err: any, message: string, caller: string) {
        if (err.status === 404) {
            this.messageService.add(`${caller}: No data found when '${message}'.`, 'error');
        }
        else if (err.status === 401) {
            this.messageService.add(`${caller}: Authentication error, 401 when '${message}'.`, 'error');
        }
        else {
            this.messageService.add(`${caller}: Rest failure when '${message}'.`, 'error');
        }
    }
}
