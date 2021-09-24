import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MessageService } from '../services/message.service';
import { Chat } from '../models/chat.model';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root',
})

export class ChatService {
  public chatMessages = new BehaviorSubject<Chat[]>([]);

  public newChatMessagesCount = new BehaviorSubject<number>(0);

  private baseUrl = 'https://corechatapi.azurewebsites.net/chat';

  constructor(private datePipe: DatePipe, private messageService: MessageService, private cryptoService: CryptoService, private httpClient: HttpClient) { }

  updateLocalChats(chatMessages) {
    this.chatMessages.next(chatMessages);
    this.updateStoreChats(chatMessages);
  }

  addLocalChat(chatMessage) {
    const chatMessages = this.chatMessages.getValue();
    chatMessages.push(chatMessage)
    this.chatMessages.next(chatMessages);
    this.updateStoreChats(chatMessages);
  }

  updateStoreChats(chatMessages) {
    chatMessages = this.filterInvalidChats(chatMessages);
    window.localStorage.setItem('chatStore', JSON.stringify(chatMessages.flat()));
  }

  filterInvalidChats(chatMessages){
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

  getStoreChats() {
    return this.filterInvalidChats(JSON.parse(window.localStorage.getItem('chatStore')).flat());
  }

  async getChats() {
    let chats = JSON.parse(window.localStorage.getItem('chatStore'));
    if (chats && chats.length > 0) {
      chats.sort((a, b) => a.id - b.id);
      const lastStoredChatId = chats[chats.length - 1].Id;
      const newChats = await this.GetChatsAfterId(lastStoredChatId);
      if (newChats && newChats.length > 0) {
        chats.push(newChats);
        chats = [...chats];
        for (const newChat of newChats) {
          const newMsgNotification = new Notification('New chat message', {
            body: `${newChat.Who}: ${newChat.Content}`,
          });
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
    chats.sort((a, b) => a.id - b.id);
    return chats;
  }

  async getChatMessages(): Promise<void> {
    let chats = await this.getChats();
    this.updateLocalChats(chats);
    this.messageService.add(`ChatService: Got all chat messages.`);
  }

  async sendChatMessage(message: string): Promise<void> {
    if (!message)
      return this.messageService.add(`ChatService: Please enter a message before posting.`, 'error');
    this.messageService.add('ChatService: Posting chat message.');

    const chat = (await this.PostChat({
      name: !this.cryptoService.username ? 'unknown' : this.cryptoService.username,
      message: message
    }));

    this.addLocalChat(chat);
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
