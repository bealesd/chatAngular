import { Component, OnInit, Input, ɵConsole } from '@angular/core';

import { RecieveChat } from '../models/recieve-chat.model';
import { ChatService } from '../services/chat.service';
import { EventService } from '../services/event.service';
import { DialogBoxService } from '../services/dialog-box.service';

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
  eventService: EventService;
  dialogBoxService: DialogBoxService;

  constructor(private chatService: ChatService) {
    this.chatService.chatMessages.subscribe(val => {
      this.chatMessages = val;
    });
  }

  public parseDateTime() {
    this.date = new Date(this.recieveChat.Datetime);
  }

  ngOnInit(): void {
    this.parseDateTime();
    this.deleted = this.recieveChat.Deleted === 'true';
    this.eventService = EventService.Instance;
    this.dialogBoxService = new DialogBoxService();
  }

  ngDoCheck(): void {
    this.deleted = this.recieveChat.Deleted === 'true';
  }

  callback() {
    alert('hi');
  }

  deleteMessage(recieveChat: RecieveChat) {
    this.dialogBoxService.register(
      `Delete Id ${recieveChat.Id}?`,
      'Soft',
      'Hard',
      () => { this.chatService.softDeleteChatMessage(recieveChat.Id, true) },
      () => { this.chatService.hardDeleteChatMessage(recieveChat.Id); });

      this.dialogBoxService.open();
  }

  undoDeleteMessage(recieveChat: RecieveChat) {
    if (confirm('Undo soft delete?')) {
      this.chatService.softDeleteChatMessage(recieveChat.Id, false);
    }
  }
}
