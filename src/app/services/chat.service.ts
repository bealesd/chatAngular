import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MessageService } from '../services/message.service';
import { ChatRepo } from '../services/chat.repo';

import { RecieveChat } from '../models/recieve-chat.model';
import { SendChat } from '../models/send-chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chatMessages = new BehaviorSubject<RecieveChat[]>([]);

  public newChatMessagesCount = new BehaviorSubject<number>(0);

  constructor(private messageService: MessageService, private chatRepo: ChatRepo) {
  }

  getChatMessages(): void {
    this.messageService.add('ChatService: Getting last 10 chat messages.');
    this.chatRepo.getLastTen().subscribe((chatMessages: RecieveChat[]) => {
      if (chatMessages === null)
        this.messageService.add(`ChatService: Failed to get last 10 chat messages.`, 'error');
      else {
        this.chatMessages.next(chatMessages);
        this.messageService.add(`ChatService: Got last 10 chat messages.`);
      }
    });
  }

  getNewChatMessages(): void {
    this.messageService.add('ChatService: Fetching new messages.');

    const currentChatMessages = this.chatMessages.getValue();
    let id = null;
    if (!currentChatMessages) id = null;
    else id = currentChatMessages[currentChatMessages.length - 1].Id;

    this.chatRepo.getNewChatMessages(id)
      .subscribe((chatMessages: RecieveChat[]) => {
        if (chatMessages === null) {
          this.messageService.add(`ChatService: Failed to get new chat messages.`, 'error');
          return;
        }
        if (chatMessages === null || chatMessages === undefined || chatMessages.length === 0) {
          this.messageService.add(`ChatService: No new messages.`);
          return;
        }
        else {
          const currentMessagesCount = this.newChatMessagesCount.getValue();
          const newMessageCount = chatMessages.length;
          this.newChatMessagesCount.next(currentMessagesCount + newMessageCount);
          this.messageService.add(`ChatService: ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}.`);

          currentChatMessages.push(...chatMessages);
          this.chatMessages.next(currentChatMessages);
        }
      });
  }

  async checkForUpdatedMessages(): Promise<void> {
    this.messageService.add('ChatService: Checking for updated messages.');
    const currentChatMessages = this.chatMessages.getValue();

    const promises = currentChatMessages.map(async (currentChatMessage) => {
      const chatMessage = await this.chatRepo.checkForUpdatedMessage(currentChatMessage.Id);
      if (chatMessage) {
        const message = currentChatMessages.find(chat => chat.Id === currentChatMessage.Id);
        Object.assign(message, chatMessage);
        this.chatMessages.next(currentChatMessages);
        this.messageService.add(`ChatService: Checked for updated message: ${chatMessage.Id}.`);
      }
      else
        this.messageService.add('ChatService: Failed to check for updated messages.', 'error');
    });
    await Promise.all(promises);
  }

  async sendChatMessage(chatMessage: SendChat): Promise<void> {
    if (chatMessage.Content) {
      this.messageService.add(`ChatService: Please enter a message before posting.`, 'error');
      return;
    }
    else if (chatMessage.Who === "" || chatMessage.Who === null || chatMessage.Who === undefined) {
      this.messageService.add(`ChatService: Unknown message sender.`, 'error');
      return;
    }

    this.messageService.add('ChatService: Posting chat message.');

    const currentChatMessages = this.chatMessages.getValue();
    const newId = Math.max(...currentChatMessages.map(msg => msg.Id)) + 1;
    chatMessage.Id = newId;

    const chatMessageResult = await this.chatRepo.postMessage(chatMessage);
    if (!chatMessageResult)
      this.messageService.add(`ChatService: Failed to post chat message id ${chatMessageResult.Id}.`, 'error');
    else {
      const oldChatMessages = this.chatMessages.getValue();
      oldChatMessages.push(chatMessageResult);
      this.chatMessages.next(oldChatMessages);
      this.messageService.add(`ChatService: Posted chat message id ${chatMessageResult.Id}.`);
    }
  }

  softDeleteChatMessage(id: number, deleteFlag: boolean): void {
    this.messageService.add(`ChatService: Marking chat message id ${id} as ${deleteFlag ? 'deleted' : 'not deleted'}.`);

    const currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(chat => chat.Id === id);

    this.chatRepo.softDeleteMessage(currentChatMessage, deleteFlag).subscribe(
      (chatMessage: RecieveChat) => {
        if (chatMessage !== undefined && chatMessage !== null) {
          Object.assign(currentChatMessage, chatMessage);
          this.messageService.add(`ChatService: Message id ${id} marked: ${deleteFlag ? 'deleted' : 'not deleted'}.`);
        }
        else
          this.messageService.add(`ChatService: Message id ${id} delete flag could not be updated.`, 'error');

        this.chatMessages.next(currentChatMessages);
      }
    );
  }


  hardDeleteChatMessage(id: number): void {
    this.messageService.add(`ChatService: Deleting message id ${id}.`);

    let currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(chat => chat.Id === id);

    this.chatRepo.hardDeleteMessage(currentChatMessage).subscribe(
      (chatMessage: Boolean) => {
        if (chatMessage) {
          this.messageService.add(`ChatService: Message id ${id} deleted.`);
          currentChatMessages = currentChatMessages.filter((chat) => chat.Id !== id);
        }
        else
          this.messageService.add(`ChatService: Could not delete message id ${id}.`, 'error');

        this.chatMessages.next(currentChatMessages);
      }
    );
  }
}
