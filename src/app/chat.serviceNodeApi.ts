import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

import { MessageService } from './message.service';

import { RecieveChatNodeApi, SendChatNodeApi } from './chatObjectNodeApi'

import { ChatRepoNodeApi } from './chatRepoNodeApi'


@Injectable({
  providedIn: 'root'
})
export class ChatServiceNodeApi {
  public chatMessages = new BehaviorSubject<RecieveChatNodeApi[]>([]);

  constructor(private messageService: MessageService, private chatRepo: ChatRepoNodeApi) {
  }

  getChatMessages(): void {
    this.messageService.add('ChatService: fetched chat messages');

    this.chatRepo.getLastTen()
      .subscribe((chatMessages) => {

        this.chatMessages.next(chatMessages);
      });
  }


  getNewChatMessages(): void {
    this.messageService.add('ChatService: fetched new chat messages');

    const currentChatMessages = this.chatMessages.getValue();
    const rowKey = currentChatMessages[currentChatMessages.length - 1].RowKey;

    this.chatRepo.getNewChatMessages(rowKey)
      .subscribe((chatMessages) => {
        if (chatMessages !== null || chatMessages !== undefined || chatMessages.length > 0)
          currentChatMessages.push(...chatMessages);
        this.chatMessages.next(currentChatMessages);
      });
  }


  checkForUpdatedMessages(): void {
    this.messageService.add('ChatService: check for updated messages');

    const currentChatMessages = this.chatMessages.getValue();

    for (let i = 0; i < currentChatMessages.length; i++) {
      const currentChatMessage = currentChatMessages[i];
      this.chatRepo.checkForUpdatedMessage(currentChatMessage.RowKey)
        .subscribe((chatMessage) => {
          const message = currentChatMessages.find(chat => chat.RowKey === currentChatMessage.RowKey);
          Object.assign(message, chatMessage);
          this.chatMessages.next(currentChatMessages);
        });
    }
  }

  sendChatMessage(chatMessage: SendChatNodeApi): Observable<RecieveChatNodeApi> {
    this.messageService.add('ChatService: posted chat message.');

    const currentChatMessages = this.chatMessages.getValue();
    const newId = Math.max(...currentChatMessages.map(msg => parseInt(msg.Id))) + 1;
    chatMessage['id'] = newId;

    return this.chatRepo.postMessage(chatMessage);
  }

  deleteChatMessage(rowKey: string): void {
    this.messageService.add('ChatService: deleted chat message.');

    const currentChatMessages = this.chatMessages.getValue();

    this.chatRepo.deleteMessage(rowKey).subscribe(() => {
      const message = currentChatMessages.find(chat => chat.RowKey === rowKey);
      message.Deleted = 'true';
      this.chatMessages.next(currentChatMessages);
    });
  }

}
