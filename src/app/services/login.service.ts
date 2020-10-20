import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { GitHubMetaData } from './../gitHubMetaData';
import { MessageService } from '../services/message.service';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public loggedIn = new BehaviorSubject<boolean>(false);
  private githubApiUrl = 'https://api.github.com/repos/bealesd/chatStore/contents';

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
    this.messageService.add(`Login attempt.`);

    this.http.get<GitHubMetaData[]>(this.githubApiUrl, this.options()).subscribe({
      next: (result) => {
        this.messageService.add('Login complete.');
        this.loggedIn.next(true);
      }, error: (err: any) => {
        this.messageService.add('Login failure.');
        this.loggedIn.next(false);
      }
    });

  }
}
