import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

import { MessageService } from '../services/message.service';
import { Chat } from '../models/chat.model';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root',
})

export class ChatService {
  public chatMessages: Chat[] = [];

  public newChatMessagesCount = new BehaviorSubject<number>(0);

  private baseUrl = 'https://corechatapi.azurewebsites.net/chat';

  constructor(
    private datePipe: DatePipe,
    private messageService: MessageService,
    private cryptoService: CryptoService,
    private httpClient: HttpClient,
    private deviceService: DeviceDetectorService) { }

  getStoreChats() {
    let chats = [];
    try {
      const localChats = JSON.parse(window.localStorage.getItem('chatStore'));
      if (Array.isArray(localChats))
        chats = this.filterInvalidChats(localChats.flat());
      chats.sort((a, b) => a.id - b.id);
    } catch { }

    return chats;
  }

  addStoreChat(chat) {
    let chats = this.getStoreChats();
    chats.push(chat);

    this.updateStoreChats(chats);
  }

  updateStoreChats(chats) {
    chats = this.filterInvalidChats(chats);
    chats.sort((a, b) => a.id - b.id);
    window.localStorage.setItem('chatStore', JSON.stringify(chats.flat()));

    this.chatMessages = chats;
  }

  filterInvalidChats(chatMessages) {
    return chatMessages.filter((chat) => {
      try {
        this.datePipe.transform(new Date(chat.Datetime), 'MM/dd/yyyy');
        return chat;
      }
      catch {
        this.messageService.add(`ChatService: Could not parse chat.`, 'error');
      }
    })
  }

  async getChatMessages(): Promise<void> {
    let chats = await this.getChats();
    this.updateStoreChats(chats);
    this.messageService.add(`ChatService: Got all chat messages.`);
  }

  async getChats() {
    let chats = this.getStoreChats();

    if (chats && chats.length > 0) {
      const lastStoredChatId = chats[chats.length - 1].Id;
      const newChats = await this.GetChatsAfterId(lastStoredChatId);
      if (newChats && newChats.length > 0) {
        chats.push(newChats);
        for (const newChat of newChats) {
          if (this.deviceService.isDesktop()) {
            new Notification('New chat message', {
              body: `${newChat.Who}: ${newChat.Content}`,
            });
          }
        };
        const currentMessagesCount = this.newChatMessagesCount.getValue();
        const newMessageCount = newChats.length;
        this.newChatMessagesCount.next(currentMessagesCount + newMessageCount);
        this.messageService.add(`ChatService: ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}.`);
      }
    }
    else {
      chats = await this.GetChats();
    }
    return chats.flat();
  }

  async sendChatMessage(message: string): Promise<void> {
    if (!message)
      return this.messageService.add(`ChatService: Please enter a message before posting.`, 'error');
    this.messageService.add('ChatService: Posting chat message.');

    const chat = (await this.PostChat({
      name: !this.cryptoService.username ? 'unknown' : this.cryptoService.username,
      message: message
    }));

    this.addStoreChat(chat);
    this.messageService.add(`ChatService: Posted chat message id ${chat.Id}.`);
  }

  GetChatsAfterId(id: number): Promise<any[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetChatsAfterId/${id}`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (chats: any[]) => {
            const chatMessages: Chat[] = [];
            if (chats && chats.length > 0) {
              chats.sort((a, b) => a.id - b.id);
              for (let i = 0; i < chats.length; i++) {
                const chatObject = chats[i];
                const chat = new Chat();
                chat.Content = chatObject.message;
                chat.Who = chatObject.name;
                chat.Datetime = chatObject.dateTime;
                chat.Id = chatObject.id;

                chatMessages.push(chat);
              }
            }
            res(chatMessages);
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
          next: (chatObject: any) => {
            const chat = new Chat();
            chat.Content = chatObject.message;
            chat.Who = chatObject.name;
            chat.Datetime = chatObject.dateTime;
            chat.Id = chatObject.id;

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
            res(chatMessages);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }
}
