import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: any = {
    'error': [],
    'info': [],
    'warning': []
  };

  add(message: string, type?: string) {
    if (type === null || type === undefined) type = 'info';

    if (type.toLocaleLowerCase() === 'error')
      this.messages['error'].push(`${new Date().toLocaleString()} - ${message}`);
    else if (type.toLocaleLowerCase() === 'info')
      this.messages['info'].push(`${new Date().toLocaleString()} - ${message}`);
    else if (type.toLocaleLowerCase() === 'warning')
      this.messages['warning'].push(`${new Date().toLocaleString()} - ${message}`);
    else
      this.messages['info'].push(`${new Date().toLocaleString()} - ${message}`);
  }

  clear() {
    this.messages = [];
  }
}
