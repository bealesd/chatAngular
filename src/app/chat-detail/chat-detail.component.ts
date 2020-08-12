import { Component, OnInit, Input, ɵConsole } from '@angular/core';

import { RecieveChat } from '../chatObject';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent implements OnInit {
  @Input() recieveChat: RecieveChat;
  date: Date;

  constructor() { }

  public parseDateTime() {
      this.date = new Date(this.recieveChat.Datetime);
  }

  ngOnInit(): void {
    this.parseDateTime();
  }
}