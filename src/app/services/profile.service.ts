import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

import { MessageService } from '../services/message.service';
import { Chat } from '../models/chat.model';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';
import { Profile } from '../models/profile.model';

enum Themes {
  light,
  dark
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl = `${environment.chatCoreUrl}/profile`

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient,
    private loginService: LoginService) { }

  loadTheme() {
    const isDarkTheme = (new Boolean(JSON.parse(window.localStorage.getItem('isDarkTheme')))).valueOf();
    const theme = isDarkTheme ? Themes.light : Themes.dark;
    document.body.classList.add(Themes[theme]);
  }

  toggleTheme() {
    const isDarkTheme = (new Boolean(JSON.parse(window.localStorage.getItem('isDarkTheme')))).valueOf();
    const oldTheme = isDarkTheme ? Themes.light : Themes.dark;
    const newTheme = !isDarkTheme ? Themes.light : Themes.dark;
    document.body.classList.remove(Themes[oldTheme]);
    document.body.classList.add(Themes[newTheme]);
    window.localStorage.setItem('isDarkTheme', JSON.stringify(!isDarkTheme));
  }

  async getProfilePicture(username): Promise<any> {
    const imageBlob = await this.GetProfile(username);
    var urlCreator = window.URL || window.webkitURL;
    return urlCreator.createObjectURL(imageBlob);
  }

  async getProfile(): Promise<any> {
    const imageBlob = await this.GetProfile(LoginService.username);
    var urlCreator = window.URL || window.webkitURL;
    window['profileImageUrl'] = urlCreator.createObjectURL(imageBlob);
  }

  async updateProfile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('Picture', file)
    formData.append('Username', LoginService.username);

    await this.PostChat(formData);
  }

  async GetProfile(username: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/GetProfile?username=${username}`);
    const blob = await response.blob();
    return blob;
  }

  PostChat(formData: FormData): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddProfile`;
      this.httpClient.post<any>(url, formData).subscribe(
        {
          next: (chatObject: any) => {
            res(true);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

}
