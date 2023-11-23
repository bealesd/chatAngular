import { Component, OnInit, Input } from '@angular/core';

import { Chat } from '../models/chat.model';
import { DialogBoxService } from '../services/dialog-box.service';
import { LoginService } from '../services/login.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent implements OnInit {
  @Input() recieveChat: Chat;
  date: string;
  deleted: boolean;
  content: string;
  dialogBoxService: DialogBoxService;
  interval: any;

  get username() {
    return LoginService.username;
  }

  constructor(private profileService: ProfileService, public loginService: LoginService) {
  }

  public parseDatetime() {
    this.date = (new Date(this.recieveChat.Datetime)).toLocaleTimeString();
  }

  ngOnInit(): void {
    this.parseDatetime();
    this.dialogBoxService = new DialogBoxService();
    this.addProfilePicture();
  }

  async addProfilePicture() {
    if (this.recieveChat.Name !== 'unknown') {
      let profileObject = window[`profileImageUrl${this.recieveChat.Name}`];

      if (profileObject === undefined) {
        window[`profileImageUrl${this.recieveChat.Name}`] = { url: null };

        const url = await this.profileService.getProfilePicture(this.recieveChat.Name);
        if (url !== null) window[`profileImageUrl${this.recieveChat.Name}`].url = url;
      }

      this.interval = setInterval(() => {
        if ((window[`profileImageUrl${this.recieveChat.Name}`].url !== null)) {
          try {
            (document.querySelector(`#img-${this.recieveChat.Id}`) as any).src = window[`profileImageUrl${this.recieveChat.Name}`].url;
            clearInterval(this.interval);
          } catch (error) {
          }
        }
      }, 1000)

    }
  }

  ngDoCheck(): void {
  }
}
