import { GitHubMetaData } from './gitHubMetaData';
import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

import { MessageService } from './message.service';

import { RecieveChat, SendChat } from './chatObject'

import { ChatRepo } from './chatRepo'


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chatMessages = new BehaviorSubject<RecieveChat[]>([]);

  constructor(private messageService: MessageService, private chatRepo: ChatRepo) {
  }

  getChatMessages(): void {
    this.messageService.add('ChatService: fetched chat messages');

    this.chatRepo.getLastTen()
      .subscribe((chatMessages: RecieveChat[]) => {
        this.chatMessages.next(chatMessages);
      });
  }

  getNewChatMessages(): void {
    this.messageService.add('ChatService: fetched new chat messages');

    const currentChatMessages = this.chatMessages.getValue();
    const id = currentChatMessages[currentChatMessages.length - 1].Id;

    this.chatRepo.getNewChatMessages(id)
      .subscribe((chatMessages: RecieveChat[]) => {
        if (chatMessages !== null || chatMessages !== undefined || chatMessages.length > 0)
          currentChatMessages.push(...chatMessages);
        this.chatMessages.next(currentChatMessages);
      });
  }

  login(): Observable<GitHubMetaData[]> {
    this.messageService.add('ChatService: login');
    return this.chatRepo.getMessageListings();
  }

  checkForUpdatedMessages(): void {
    this.messageService.add('ChatService: check for updated messages');

    const currentChatMessages = this.chatMessages.getValue();

    this.chatRepo.getMessageListings().subscribe((chatListing) => {
      for (let i = 0; i < currentChatMessages.length; i++) {
        const currentChatMessage = currentChatMessages[i];
        const sha = currentChatMessage.Sha;

        if (!chatListing.map(chat => chat.sha).includes(sha)) {
          this.chatRepo.checkForUpdatedMessage(currentChatMessage.Id)
            .subscribe((chatMessage: RecieveChat) => {
              const message = currentChatMessages.find(chat => chat.Id === currentChatMessage.Id);
              Object.assign(message, chatMessage);
              this.chatMessages.next(currentChatMessages);
            });
        }
      }
    })
  }

  sendChatMessage(chatMessage: SendChat): Observable<RecieveChat> {
    this.messageService.add('ChatService: posted chat message.');

    const currentChatMessages = this.chatMessages.getValue();
    const newId = Math.max(...currentChatMessages.map(msg => msg.Id)) + 1;
    chatMessage.Id = newId;

    return this.chatRepo.postMessage(chatMessage);
  }

  deleteChatMessage(id: number): void {
    this.messageService.add('ChatService: deleted chat message.');

    const currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(chat => chat.Id === id);

    this.chatRepo.softDeleteMessage(currentChatMessage).subscribe((chatMessage: RecieveChat) => {
      if (chatMessage === undefined || chatMessage === null)
        Object.assign(currentChatMessage, chatMessage);
      this.chatMessages.next(currentChatMessages);
    });
  }
}
