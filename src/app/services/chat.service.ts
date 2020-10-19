import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { GitHubMetaData } from './../gitHubMetaData';
import { MessageService } from '../services/message.service';
import { RecieveChat } from '../models/recieve-chat.model';
import { SendChat } from '../models/send-chat.model';
import { ChatRepo } from './chat.repo'

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chatMessages = new BehaviorSubject<RecieveChat[]>([]);

  public newChatMessagesCount = new BehaviorSubject<number>(0);
  public loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private messageService: MessageService, private chatRepo: ChatRepo) {
  }

  getChatMessages(): void {
    this.messageService.add('Getting last 10 chat messages.');

    this.chatRepo.getLastTen().subscribe(
      {
        next: (chatMessages: RecieveChat[]) => {
          this.chatMessages.next(chatMessages);

          this.messageService.add(`Got last 10 chat messages.`);
        },
        error: (err: any) => {
          if (err.status === 404)
            this.messageService.add(`No chat messages.`);
          else if (err.status === 401) {
            this.messageService.add(`Could not get chat messages. Authentication error, 401.`);
            alert('Authentication error. You may need to login.');
          }
          else {
            this.messageService.add(`Could not get chat messages.`);
            console.error(err);
          }
        }
      }
    );
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
      .subscribe(
        {
          next: (chatMessages: RecieveChat[]) => {
            if (chatMessages === null || chatMessages === undefined || chatMessages.length === 0) {
              this.messageService.add(` • No new messages.`);
              return;
            }
            else {
              let currentMessagesCount = this.newChatMessagesCount.getValue();
              let newMessageCount = chatMessages.length;
              this.newChatMessagesCount.next(currentMessagesCount + newMessageCount);
              this.messageService.add(` • ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}.`);

              currentChatMessages.push(...chatMessages);
              this.chatMessages.next(currentChatMessages);
            }
          },
          error: (err: any) => {
            if (err.status === 404)
              this.messageService.add(`No new chat messages.`);
            else if (err.status === 401) {
              this.messageService.add(`Could not get new chat messages. Authentication error, 401.`);
              alert('Authentication error. You may need to login.');
            }
            else {
              this.messageService.add(`Could not get new chat messages.`);
              console.error(err);
            }
          }
        }
      );
  }

  checkForUpdatedMessages(): void {
    this.messageService.add('Checking for updated messages.');

    const currentChatMessages = this.chatMessages.getValue();

    this.chatRepo.getMessageListings().subscribe({
      next: (chatListing) => {
        for (let i = 0; i < currentChatMessages.length; i++) {
          const currentChatMessage = currentChatMessages[i];
          const sha = currentChatMessage.Sha;

          if (!chatListing.map(chat => chat.sha).includes(sha)) {
            this.chatRepo.checkForUpdatedMessage(currentChatMessage.Id)
              .subscribe({
                next: (chatMessage: RecieveChat) => {
                  const message = currentChatMessages.find(chat => chat.Id === currentChatMessage.Id);
                  Object.assign(message, chatMessage);
                  this.chatMessages.next(currentChatMessages);
                },
                error: (err: any) => {
                  if (err.status === 404)
                    this.messageService.add(`No updated chat messages.`);
                  else if (err.status === 401) {
                    this.messageService.add(`Could not get updated chat messages. Authentication error, 401.`);
                    alert('Authentication error. You may need to login.');
                  }
                  else {
                    this.messageService.add(`Could not get updated chat messages.`);
                    console.error(err);
                  }
                }
              });
          }
        }
      },
      error: (err: any) => {
        if (err.status === 404)
          this.messageService.add(`Could not find message listing.`);
        else if (err.status === 401) {
          this.messageService.add(`Could not get message listin. Authentication error, 401.`);
          alert('Authentication error. You may need to login.');
        }
        else {
          this.messageService.add(`Could not get message listing.`);
          console.error(err);
        }
      }
    });
  }

  sendChatMessage(chatMessage: SendChat): Observable<RecieveChat> {
    if (chatMessage.Content === "" || chatMessage.Content === null || chatMessage.Content === undefined) {
      this.messageService.add(`Please enter a message before posting.`);
      return;
    }
    else if (chatMessage.Who === "" || chatMessage.Who === null || chatMessage.Who === undefined) {
      this.messageService.add(`Unknown message sender.`);
      return;
    }

    this.messageService.add('Posting chat message.');

    const currentChatMessages = this.chatMessages.getValue();
    const newId = Math.max(...currentChatMessages.map(msg => msg.Id)) + 1;
    chatMessage.Id = newId;

    return this.chatRepo.postMessage(chatMessage);
  }

  softDeleteChatMessage(id: number, deleteFlag: boolean): void {
    this.messageService.add(`Marking chat message id ${id} as ${deleteFlag ? 'deleted' : 'not deleted'}.`);

    const currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(chat => chat.Id === id);

    this.chatRepo.softDeleteMessage(currentChatMessage, deleteFlag).subscribe({
      next: (chatMessage: RecieveChat) => {
        if (chatMessage !== undefined && chatMessage !== null) {
          Object.assign(currentChatMessage, chatMessage);
          this.messageService.add(` • Message id ${id} marked: ${deleteFlag ? 'deleted' : 'not deleted'}.`);
        }
        else {
          this.messageService.add(` • Message id ${id} delete flag could not be updated.`);
        }

        this.chatMessages.next(currentChatMessages);
      },
      error: (data: any) => {
        this.messageService.add(`Could not update delete flag, message id ${id}.`);
      }
    });
  }


  hardDeleteChatMessage(id: number): void {
    this.messageService.add(`Deleting message id ${id}.`);

    let currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(chat => chat.Id === id);

    this.chatRepo.hardDeleteMessage(currentChatMessage).subscribe({
      next: (chatMessage: RecieveChat) => {
      if (chatMessage !== undefined && chatMessage !== null) {
        this.messageService.add(` • Message id ${id} deleted.`);
        currentChatMessages = currentChatMessages.filter((chat) => chat.Id !== id);
      }
      else {
        this.messageService.add(` • Message id ${id} could not be deleted.`);
      }

      this.chatMessages.next(currentChatMessages);
    },
    error: (data: any) => {
      this.messageService.add(`Could not delete message id ${id}.`);
    }
  });
  }
}
