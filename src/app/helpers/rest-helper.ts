import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CryptoService } from '../services/crypto.service';
import { LoggerService } from '../services/logger.service';

import { MessageService } from '../services/message.service';

@Injectable({
    providedIn: 'root'
})
export class RestHelper {
    constructor(
        private cryptoService: CryptoService,
        private messageService: MessageService,
        private http: HttpClient,
        private loggerService: LoggerService
    ) { }

    options = (): { headers: HttpHeaders } => {
        const options = { headers: new HttpHeaders() };
        try {
            options.headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.cryptoService.getToken()}`,
                // 'Cache-Control': 'no-cache'
            });
        }
        catch (error) {
            this.messageService.add(` • Getting token failed.`, 'error');
        }
        return options;
    }

    removeUrlParams = (rawUrl: string) =>
        new URL(rawUrl).origin + new URL(rawUrl).pathname;

    errorMessageHandler(err: any, type: string) {
        if (err.status === 404) {
            this.loggerService.log(` • No data found when '${type}'.`, 'error');
            this.messageService.add(` • No data found when '${type}'.`, 'error');
        }
        else if (err.status === 401) {
            this.loggerService.log(` • Authentication error, 401 when '${type}'.`, 'error');
            this.messageService.add(` • Authentication error, 401 when '${type}'.`, 'error');
        }
        else {
            this.loggerService.log(` • Rest failiure when '${type}'.`, 'error');
            this.messageService.add(` • Rest failiure when '${type}'.`, 'error');
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
                    this.errorMessageHandler(err, `failed to create repo: ${name}`);
                }
            }
        );
    }
}
