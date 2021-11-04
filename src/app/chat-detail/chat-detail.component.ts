import { Component, OnInit, Input } from '@angular/core';

import { Chat } from '../models/chat.model';
import { DialogBoxService } from '../services/dialog-box.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent implements OnInit {
  @Input() recieveChat: Chat;
  date: Date;
  deleted: boolean;
  content: string;
  dialogBoxService: DialogBoxService;
  interval: any;

  constructor(private profileService: ProfileService) {

  }

  public parseDateTime() {
    this.date = new Date(this.recieveChat.Datetime);
  }

  ngOnInit(): void {
    this.parseDateTime();
    this.dialogBoxService = new DialogBoxService();
    this.addProfilePicture();
  }

  async addProfilePicture() {
    if (this.recieveChat.Who !== 'unknown') {
      let profileObject = window[`profileImageUrl${this.recieveChat.Who}`];

      if (profileObject === undefined) {
        window[`profileImageUrl${this.recieveChat.Who}`] = { url: null };

        const url = await this.profileService.getProfilePicture(this.recieveChat.Who);
        window[`profileImageUrl${this.recieveChat.Who}`].url = url;
      }

      this.interval = setInterval(()=>{
        if((window[`profileImageUrl${this.recieveChat.Who}`].url === null)){
          let a = 1
        }
        else{
          (document.querySelector(`#img-${this.recieveChat.Id}`) as any).src = window[`profileImageUrl${this.recieveChat.Who}`].url;
          clearInterval(this.interval);
        }
      }, 1000)
      
    }
  }

  ngDoCheck(): void {
  }
}
