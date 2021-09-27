import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = `${environment.chatCoreUrl}/log`;
  messages: any = [];
  types = ['error', 'info', 'warning']
  public isLoggingOn = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient) {   }

  add(message: string, type?: string) {
    if (!this.types.includes(type)) type = 'info';

    type = type.toLocaleLowerCase();
    const timeMessage = `${new Date().toLocaleString()} - ${message}`;

    this.messages.unshift({ 'type': type, 'message': timeMessage });

    if (type === 'info')
      console.info(`%c${timeMessage}`, "color: green; font-size: 12px");
    else if (type === 'error')
      console.error(`%c${timeMessage}`, "color: red; font-size: 12px");

    this.postLog({'message': message, 'level': type});
  }

  clear() {
    this.messages = [];
  }

  postLog(log: any): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddLog`;
      this.httpClient.post<any>(url, log).subscribe(
        {
          next: (result: any) => {
            res(result);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }
}
