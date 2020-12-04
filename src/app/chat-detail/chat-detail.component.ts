import { Component, OnInit, Input } from '@angular/core';

import { Chat } from '../models/chat.model';
import { ChatService } from '../services/chat.service';
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

  constructor(private chatService: ChatService) {  }

  public parseDateTime() {
    this.date = new Date(this.recieveChat.Datetime);
  }

  ngOnInit(): void {
    this.parseDateTime();
    this.deleted = this.recieveChat.Deleted === 'true';
    this.dialogBoxService = new DialogBoxService();
  }

  ngDoCheck(): void {
    this.deleted = this.recieveChat.Deleted === 'true';
  }

  deleteMessage(recieveChat: Chat) {
    this.dialogBoxService.register(
      `Delete Id ${recieveChat.Id}?`,
      'Soft',
      'Hard',
      () => { this.chatService.softDeleteChatMessage(recieveChat.Id, true) },
      () => { this.chatService.hardDeleteChatMessage(recieveChat.Id); });

      this.dialogBoxService.open();
  }

  undoDeleteMessage(recieveChat: Chat) {
    if (confirm('Undo soft delete?')) {
      this.chatService.softDeleteChatMessage(recieveChat.Id, false);
    }
  }
}
