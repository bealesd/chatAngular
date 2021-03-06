import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MessageService } from '../services/message.service';
import { ChatRepo } from '../services/chat.repo';

import { Chat, ChatContainer } from '../models/chat.model';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chatMessages = new BehaviorSubject<ChatContainer[]>([]);

  public newChatMessagesCount = new BehaviorSubject<number>(0);

  constructor(private messageService: MessageService, private chatRepo: ChatRepo, private cryptoService: CryptoService) {}

  async getChatMessages(): Promise<void> {
    this.messageService.add('ChatService: Getting last 10 chat messages.');
    const chatMessages = await this.chatRepo.getLastTen()
    if (chatMessages === null)
      this.messageService.add(`ChatService: Failed to get last 10 chat messages.`, 'error');
    else {
      this.chatMessages.next(chatMessages);
      this.messageService.add(`ChatService: Got last 10 chat messages.`);
    }
  }

  async getNewChatMessages(): Promise<void> {
    this.messageService.add('ChatService: Fetching new messages.');

    const chatMessages = this.chatMessages.getValue();
    
    let lastId = null;
    if (!chatMessages || chatMessages.length === 0) lastId = null;
    else lastId = chatMessages[chatMessages.length - 1].chat.Id;

    let newChatMessages = await this.chatRepo.getNewChatMessages(lastId);
    if (newChatMessages === null) 
      return this.messageService.add(`ChatService: Failed to get new chat messages.`, 'error');
    else if (newChatMessages.length === 0) 
      return this.messageService.add(`ChatService: No new messages.`);
    else {
      const currentMessagesCount = this.newChatMessagesCount.getValue();
      const newMessageCount = newChatMessages.length;
      this.newChatMessagesCount.next(currentMessagesCount + newMessageCount);
      this.messageService.add(`ChatService: ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}.`);

      chatMessages.push(...newChatMessages);
      this.chatMessages.next(chatMessages);
    }
  }

  async checkForUpdatedMessages(): Promise<void> {
    this.messageService.add('ChatService: Checking for updated messages.');
    const chatMessages = this.chatMessages.getValue();

    for (let i = 0; i < chatMessages.length; i++) {
      const currentChatMessage = chatMessages[i];
      const chatMessage = await this.chatRepo.checkForUpdatedMessage(currentChatMessage);
      if (chatMessage) {
        const message = chatMessages.find(chat => chat.chat.Id === currentChatMessage.chat.Id);
        Object.assign(message, chatMessage);
        this.chatMessages.next(chatMessages);
        this.messageService.add(`ChatService: Checked for updated message: ${chatMessage.Id}.`);
      }
      else
        this.messageService.add('ChatService: Failed to check for updated messages.', 'error');
    }
  }

  async sendChatMessage(message: string): Promise<void> {
    if (!message) 
      return this.messageService.add(`ChatService: Please enter a message before posting.`, 'error');
    
    this.messageService.add('ChatService: Posting chat message.');

    const chatMessages = this.chatMessages.getValue();
    const newId = chatMessages.length === 0 ? 1 : Math.max(...chatMessages.map(msg => msg.chat.Id)) + 1;
    
    const chat = <Chat>{ 
      Who: this.cryptoService.username, 
      Content: message ,
      Id: newId,
      Deleted: 'false',
      Datetime: new Date().getTime()
    }

    const chatContainer = new ChatContainer();
    chatContainer.chat = chat;

    const metadata = await this.chatRepo.postMessage(chatContainer.chat);
    if (!metadata)
      this.messageService.add(`ChatService: Failed to post chat message id ${chat.Id}.`, 'error');
    else {
      chatContainer.metadata = metadata;
      chatMessages.push(chatContainer);
      this.chatMessages.next(chatMessages);
      this.messageService.add(`ChatService: Posted chat message id ${chat.Id}.`);
    }
  }

  async softDeleteChatMessage(chat: ChatContainer, deleteFlag: boolean): Promise<void> {
    this.messageService.add(`ChatService: Marking chat message id ${chat.chat.Id} as ${deleteFlag ? 'deleted' : 'not deleted'}.`);

    const currentChatMessages = this.chatMessages.getValue();
    const currentChatMessage = currentChatMessages.find(c => c.chat.Id === chat.chat.Id);
    currentChatMessage.chat.Deleted = deleteFlag ? 'true' : 'false';

    const result = await this.chatRepo.softDeleteMessage(currentChatMessage);
    if (result) {
      this.messageService.add(`ChatService: Message id ${chat.chat.Id} marked: ${deleteFlag ? 'deleted' : 'not deleted'}.`);
      this.chatMessages.next(currentChatMessages);
    }
    else
      this.messageService.add(`ChatService: Message id ${chat.chat.Id} delete flag could not be updated.`, 'error');
  }

  async hardDeleteChatMessage(chat: ChatContainer): Promise<void> {
    this.messageService.add(`ChatService: Deleting message id ${chat.chat.Id}.`);

    let currentChatMessages = this.chatMessages.getValue();
    const chatMessage = currentChatMessages.find(c => c.metadata.key === chat.metadata.key);
    const result = await this.chatRepo.hardDeleteMessage(chatMessage);

    if (result) {
      this.messageService.add(`ChatService: Message id ${chat.chat.Id} deleted.`);
      currentChatMessages = currentChatMessages.filter((c) => c.metadata.key !== chat.metadata.key);
      this.chatMessages.next(currentChatMessages);
    }
    else
      this.messageService.add(`ChatService: Could not delete message id ${chat.chat.Id}.`, 'error');
  }
}
