import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { MessageService } from '../services/message.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public loggedIn = new BehaviorSubject<boolean>(false);
  public jwtToken = '';
  private baseUrl = `${environment.chatCoreUrl}/auth`;
  public username = '';

  constructor(
    private messageService: MessageService, 
    private http: HttpClient) {  }

  async login(username: string, password: string): Promise<void> {
   this.messageService.addNoAuth('LoginService: Getting jwt token.');

    const token = (await this.GetToken({
      username: username,
      password: password
    }));

    this.username = username; 

    this.jwtToken = token;

    this.messageService.add(`LoginService: Got jwt token.`);
  }

  setTheme() {
    if (this.username.toLowerCase() === 'esther')
      document.body.classList.add('dark');
    else if(this.username.toLowerCase() === 'admin')
      document.body.classList.add('dave');
    else
      document.body.className = 'dark';
  }

  GetToken(user: any): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/Login`;
      this.http.post<any>(url, user).subscribe(
        {
          next: (object: any) => {
            this.loggedIn.next(true);
            res(object);
          },
          error: (err: any) => {
            this.loggedIn.next(false);
            res(null);
          }
        }
      );
    });
  }

}
