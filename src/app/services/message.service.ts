import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: any = [];

  add(message: string, type?: string) {
    if (type === null || type === undefined) type = 'info';

    if (type.toLocaleLowerCase() === 'error')
      this.messages.push({ 'type': 'error', 'message': `${new Date().toLocaleString()} - ${message}` });
    else if (type.toLocaleLowerCase() === 'info')
      this.messages.push({ 'type': 'info', 'message': `${new Date().toLocaleString()} - ${message}` });
    else if (type.toLocaleLowerCase() === 'warning')
      this.messages.push({ 'type': 'warning', 'message': `${new Date().toLocaleString()} - ${message}` });
    else
      this.messages.push({ 'type': 'info', 'message': `${new Date().toLocaleString()} - ${message}` });
  }

  clear() {
    this.messages = [];
  }
}
