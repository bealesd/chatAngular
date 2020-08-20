import { Component, OnInit, Input, ɵConsole } from '@angular/core';

import { RecieveChat } from '../chatObject';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent implements OnInit {
  @Input() recieveChat: RecieveChat;
  date: Date;
  chatMessages: RecieveChat[];
  deleted: boolean;
  content: string;

  constructor(private chatService: ChatService) {
    this.chatService.chatMessages.subscribe(val => {
      this.chatMessages = val;
    })
  }

  public parseDateTime() {
    this.date = new Date(this.recieveChat.Datetime);
  }

  ngOnInit(): void {
    this.parseDateTime();
    this.deleted = this.recieveChat.Deleted === 'true';
  }

  ngDoCheck():void{
    this.deleted = this.recieveChat.Deleted === 'true';
  }

  deleteMessage(recieveChat: RecieveChat) {
    if (window.confirm('Delete message?'))
      this.chatService.deleteChatMessage(recieveChat.Id);
  }
}
