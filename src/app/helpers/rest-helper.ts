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
        private http: HttpClient
    ) { }

    options = (): { headers: HttpHeaders } => {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.cryptoService.getToken()}`
            })
        }
    }

    removeUrlParams = (rawUrl: string) =>
        new URL(rawUrl).origin + new URL(rawUrl).pathname;

    errorMessageHandler(err: any, type: string) {
        if (err.status === 404)
            this.messageService.add(` • No data found when '${type}'.`, 'error');
        else if (err.status === 401) {
            this.messageService.add(` • Authentication error, 401 when '${type}'.`, 'error');
        }
        else
            this.messageService.add(` • Rest failiure when '${type}'.`, 'error');
    }

    createRepo(name: string, description: string) {
        const repoPath = 'https://api.github.com/bealesd/repos'
        const postUrl = `${repoPath}`;

        const rawCommitBody = JSON.stringify({
            "name": name,
            "description": description,
            "private": false
        });

        this.http.put<{ content: any }>(postUrl, rawCommitBody, this.options()).subscribe(
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
