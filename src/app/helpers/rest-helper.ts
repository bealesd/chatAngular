import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CryptoService } from '../services/crypto.service';

import { MessageService } from '../services/message.service';

@Injectable({
    providedIn: 'root'
})
export class RestHelper {
    constructor(
        private cryptoService: CryptoService,
        private messageService: MessageService,
        private http: HttpClient,
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
            this.messageService.add(`${caller}: Rest failiure when '${message}'.`, 'error');
        }
    }

    createRepo(name: string, description: string) {
        const postUrl = 'https://api.github.com/users/bealesd/repos';

        const rawCommitBody = {
            "name": name,
            "description": description,
            "private": false
        };

        this.http.post<{ content: any }>(postUrl, rawCommitBody, this.options()).subscribe(
            {
                next: (result: any) => {
                    this.messageService.add(` • Created repo: ${name}.`);
                },
                error: (err: any) => {
                    this.errorMessageHandler(err, `failed to create repo: ${name}`, 'CreateRepo');
                }
            }
        );
    }
}
