import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { MessageService } from '../services/message.service';
import { Chat } from '../models/chat.model';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chatMessages = new BehaviorSubject<Chat[]>([]);

  public newChatMessagesCount = new BehaviorSubject<number>(0);

  private baseUrl = 'https://corechatapi.azurewebsites.net/chat';

  constructor(private messageService: MessageService, private cryptoService: CryptoService, private httpClient: HttpClient) { }

  async getChatMessages(): Promise<void> {

    let chats = await this.GetChats();
    chats.sort((a, b) => a.id - b.id);

    const chatMessages: Chat[] = [];
    for (let i = 0; i < chats.length; i++) {

      const chatObject = chats[i];
      const chat = new Chat();
      chat.Content = chatObject.message;
      chat.Who = chatObject.name;
      chat.Datetime = chatObject.dateTime;
      chat.Id = chatObject.id;

      chatMessages.push(chat);
    }

    this.chatMessages.next(chatMessages);
    this.messageService.add(`ChatService: Got last 10 chat messages.`);
  }

  async getNewChatMessages(): Promise<void> {
    this.messageService.add('ChatService: Fetching new messages.');

    const currentChatMessages = this.chatMessages.getValue();

    let lastId = null;
    if (!currentChatMessages || currentChatMessages.length === 0) lastId = null;
    else lastId = currentChatMessages[currentChatMessages.length - 1].Id;

    let chats = await this.GetChatsAfterId(lastId);
    chats.sort((a, b) => a.id - b.id);
    
    const chatMessages: Chat[] = [];
    for (let i = 0; i < chats.length; i++) {
      const chatObject = chats[i];
      const chat = new Chat();
      chat.Content = chatObject.message;
      chat.Who = chatObject.name;
      chat.Datetime = chatObject.dateTime;
      chat.Id = chatObject.id;

      chatMessages.push(chat);
    }


    if (chatMessages.length === 0)
      return this.messageService.add(`ChatService: No new messages.`);
    else {
      for (const chat of chatMessages) {
        const newMsgNotification = new Notification('New chat message', {
          body: `${chat.Who}: ${chat.Content}`,
        });
      };

      const currentMessagesCount = this.newChatMessagesCount.getValue();
      const newMessageCount = chats.length;
      this.newChatMessagesCount.next(currentMessagesCount + newMessageCount);
      this.messageService.add(`ChatService: ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}.`);

      currentChatMessages.push(...chatMessages);
      this.chatMessages.next(currentChatMessages);
    }
  }

  async sendChatMessage(message: string): Promise<void> {
    if (!message)
      return this.messageService.add(`ChatService: Please enter a message before posting.`, 'error');
    this.messageService.add('ChatService: Posting chat message.');

    const chatMessages = this.chatMessages.getValue();

    const chatObject = (await this.PostChat({
      name: this.cryptoService.username,
      message: message
    }));

    const chat = new Chat();
    chat.Content = chatObject.message;
    chat.Who = chatObject.name;
    chat.Datetime = chatObject.dateTime;
    chat.Id = chatObject.id;

    chatMessages.push(chat);
    this.chatMessages.next(chatMessages);
    this.messageService.add(`ChatService: Posted chat message id ${chat.Id}.`);
  }

  GetChatsAfterId(id: number): Promise<any[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetChatsAfterId/${id}`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (chats: any[]) => {
            res(chats);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  PostChat(chat: any): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddChat`;
      this.httpClient.post<any>(url, chat).subscribe(
        {
          next: (chat: any) => {
            res(chat);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  GetChats(): Promise<any[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetChats`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (chats: any[]) => {
            res(chats);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }
}
