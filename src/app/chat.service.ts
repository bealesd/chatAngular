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
    this.messageService.add('Fetching last 10 messages.');

    this.chatRepo.getLastTen()
      .subscribe((chatMessages: RecieveChat[]) => {
        this.chatMessages.next(chatMessages);
      });
  }

  getNewChatMessages(): void {
    this.messageService.add('Fetching new messages.');

    const currentChatMessages = this.chatMessages.getValue();
    let id = null;
    if (currentChatMessages.length === 0 || currentChatMessages === null || currentChatMessages === undefined)
      id = null;
    else
      id = currentChatMessages[currentChatMessages.length - 1].Id;

    this.chatRepo.getNewChatMessages(id)
      .subscribe((chatMessages: RecieveChat[]) => {
        if (chatMessages !== null || chatMessages !== undefined || chatMessages.length > 0)
          currentChatMessages.push(...chatMessages);
        this.chatMessages.next(currentChatMessages);
      });
  }

  login(type: string): Observable<GitHubMetaData[]> {
    this.messageService.add(`${type} Login attempt.`);
    return this.chatRepo.attemptLogin();
  }

  checkForUpdatedMessages(): void {
    this.messageService.add('Checking for updated messages.');

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
    this.messageService.add('Posting chat message.');

    const currentChatMessages = this.chatMessages.getValue();
    const newId = Math.max(...currentChatMessages.map(msg => msg.Id)) + 1;
    chatMessage.Id = newId;

    return this.chatRepo.postMessage(chatMessage);
  }

  softDeleteChatMessage(id: number, deleteFlag: boolean): void {
    this.messageService.add(`Marking chat message as ${deleteFlag ? 'deleted' : 'not deleted'}.`);

    const currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(chat => chat.Id === id);

    this.chatRepo.softDeleteMessage(currentChatMessage, deleteFlag).subscribe((chatMessage: RecieveChat) => {
      if (chatMessage !== undefined || chatMessage !== null)
        Object.assign(currentChatMessage, chatMessage);
      this.chatMessages.next(currentChatMessages);
    });
  }


  hardDeleteChatMessage(id: number): void {
    this.messageService.add('Marking chat message as deleted.');

    let currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(chat => chat.Id === id);

    this.chatRepo.hardDeleteMessage(currentChatMessage).subscribe((chatMessage: RecieveChat) => {
      if (chatMessage !== undefined || chatMessage !== null)
        currentChatMessages = currentChatMessages.filter((chat) => chat.Id !== id);

      this.chatMessages.next(currentChatMessages);
    });
  }
}
