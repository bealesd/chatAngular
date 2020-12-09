import { Component, OnInit, Input } from '@angular/core';

import { Chat, ChatContainer } from '../models/chat.model';
import { ChatService } from '../services/chat.service';
import { DialogBoxService } from '../services/dialog-box.service';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent implements OnInit {
  @Input() recieveChat: ChatContainer;
  date: Date;
  deleted: boolean;
  content: string;
  dialogBoxService: DialogBoxService;

  constructor(private chatService: ChatService) {  }

  public parseDateTime() {
    this.date = new Date(this.recieveChat.chat.Datetime);
  }

  ngOnInit(): void {
    this.parseDateTime();
    this.deleted = this.recieveChat.chat.Deleted === 'true';
    this.dialogBoxService = new DialogBoxService();
  }

  ngDoCheck(): void {
    this.deleted = this.recieveChat.chat.Deleted === 'true';
  }

  deleteMessage(recieveChat: ChatContainer) {
    this.dialogBoxService.register(
      `Delete Id ${recieveChat.chat.Id}?`,
      'Soft',
      'Hard',
      () => { this.chatService.softDeleteChatMessage(recieveChat, true) },
      () => { this.chatService.hardDeleteChatMessage(recieveChat); });

      this.dialogBoxService.open();
  }

  undoDeleteMessage(recieveChat: ChatContainer) {
    if (confirm('Undo soft delete?')) {
      this.chatService.softDeleteChatMessage(recieveChat, false);
    }
  }
}
