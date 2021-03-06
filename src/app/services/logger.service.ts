import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  isDevMode: boolean = isDevMode();

  types = ['info', 'error'];

  log(message: any, type: string) {
    if (!this.isDevMode) return;

    if (typeof(message) === 'object') {
      if (type === 'info')
        console.info(JSON.parse(JSON.stringify(message)));
      else if (type === 'error')
        console.error(JSON.parse(JSON.stringify(message)));
    }
    else {
      if (!this.types.includes(type))
        type = 'info'
      if (type === 'info')
        console.info(`%c${message}`, "color: green; font-size: 12px");
      else if (type === 'error')
        console.error(`%c${message}`, "color: red; font-size: 12px");
    }
  }
}
