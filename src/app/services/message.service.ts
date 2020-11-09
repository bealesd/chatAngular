import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: any = [];
  types = ['error', 'info', 'warning']

  add(message: string, type?: string) {
    if (!this.types.includes(type)) type = 'info';

    this.messages.unshift({ 'type': type.toLocaleLowerCase(), 'message': `${new Date().toLocaleString()} - ${message}` });
  }

  clear() {
    this.messages = [];
  }
}
