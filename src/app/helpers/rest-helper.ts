import { Injectable } from '@angular/core';

import { MessageService } from '../services/message.service';

@Injectable({
    providedIn: 'root'
})
export class RestHelper {
    constructor(private messageService: MessageService) {
    }

    removeUrlParams = (rawUrl: string) =>
        new URL(rawUrl).origin + new URL(rawUrl).pathname;

    errorMessageHandler(err: any, type: string) {
        if (err.status === 404)
            this.messageService.add(`No data found when '${type}'.`, 'error');
        else if (err.status === 401) {
            this.messageService.add(`Authentication error, 401 when '${type}'.`, 'error');
            // alert('Authentication error. You may need to login.');
        }
        else 
            this.messageService.add(`Rest failiure when '${type}'.`, 'error');
    }
}
