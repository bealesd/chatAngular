import { Component, OnInit, Input } from '@angular/core';

import { Chat } from '../models/chat.model';
import { DialogBoxService } from '../services/dialog-box.service';

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

  constructor() {}

  public parseDateTime() {
    this.date = new Date(this.recieveChat.Datetime);
  }

  ngOnInit(): void {
    this.parseDateTime();
    this.dialogBoxService = new DialogBoxService();
  }

  ngDoCheck(): void {
  }
}
