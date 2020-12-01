import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { GitHubMetaData } from '../models/gitHubMetaData';
import { MessageService } from '../services/message.service';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public loggedIn = new BehaviorSubject<boolean>(false);
  private githubApiUrl = 'https://api.github.com';

  options = (): { headers: HttpHeaders } => {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cryptoService.getToken()}`
      })
    }
  }

  constructor(private cryptoService: CryptoService, private messageService: MessageService, private http: HttpClient) {  }

  login() {
    this.messageService.add(`LoginService: Login attempt.`, 'info');

    this.http.get<GitHubMetaData[]>(this.githubApiUrl, this.options()).subscribe({
      next: (result) => {
        this.messageService.add('LoginService: Login complete.', 'info');
        this.loggedIn.next(true);
      }, error: (err: any) => {
        this.messageService.add('LoginService: Login failure.', 'error');
        this.loggedIn.next(false);
      }
    });

  }
}
