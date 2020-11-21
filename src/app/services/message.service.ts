import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: any = [];
  types = ['error', 'info', 'warning']

  constructor(
    private loggerService: LoggerService
  ){}

  add(message: string, type?: string) {
    if (!this.types.includes(type)) type = 'info';

    this.messages.unshift({ 'type': type.toLocaleLowerCase(), 'message': `${new Date().toLocaleString()} - ${message}` });
    this.loggerService.log(message, type);
  }

  clear() {
    this.messages = [];
  }
}
