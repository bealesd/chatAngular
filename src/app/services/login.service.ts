import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { GitHubMetaData } from './../gitHubMetaData';
import { MessageService } from '../services/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public loggedIn = new BehaviorSubject<boolean>(false);
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/chatStore/contents';
  options = (): { headers: HttpHeaders } => {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cryptoService.getToken()}`
      })
    }
  }
  constructor(private cryptoService: CryptoService, private messageService: MessageService,private http: HttpClient) {
  }

  login(type: string): Observable<GitHubMetaData[]> {
    this.messageService.add(`${type} Login attempt.`);
    return this.attemptLogin();
  }
 
  tryLogin(type: string) {
    this.messageService.add(`${type} Login attempt.`);

    this.attemptLogin().subscribe({
      next: (result) => {
        this.messageService.add('Login complete.');
        this.loggedIn.next(true);
      }, error: (err: any) => {
        this.messageService.add('Login failure.');
        this.loggedIn.next(false);
      }
    });

  }

  attemptLogin = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options());
  }

}
