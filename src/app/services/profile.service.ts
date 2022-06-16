import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MessageService } from '../services/message.service';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

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
    if (imageBlob === null) return null;
    
    const urlCreator = window.URL || window.webkitURL;
    return urlCreator.createObjectURL(imageBlob);
  }

  async getProfile(): Promise<any> {
    const imageBlob = await this.GetProfile(LoginService.username);
    var urlCreator = window.URL || window.webkitURL;
    window['profileImageUrl'] = urlCreator.createObjectURL(imageBlob);
  }

  async updateProfile(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('Picture', file)
    formData.append('Username', LoginService.username);

    const result = await this.AddProfile(formData);
    if (!result)
      this.messageService.add(`ProfileService: Could not add profile image.`, 'error');
    else
      this.messageService.add(`ProfileService: Added profile image.`);

    return result
  }

  async GetProfile(username: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/GetProfile?username=${username}`);
    if (response.status === 200) return await response.blob();
    else return null;
  }

  AddProfile(formData: FormData): Promise<boolean> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddProfile`;
      this.httpClient.post<any>(url, formData).subscribe(
        {
          next: (object: any) => {
            res(true);
          },
          error: (err: any) => {
            res(false);
          }
        }
      );
    });
  }

}
