import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

import { MessageService } from '../services/message.service';
import { Chat } from '../models/chat.model';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';
import { ChatGroupUsernameDTO } from '../models/chat-group-username.model';
import { Auth } from '../models/profile.model copy';

@Injectable({
  providedIn: 'root',
})

export class ChatService {
  public chatMessages: Chat[] = [];
  public chatMessagesByDate = [];
  public chatMessagesByDateSubject = new BehaviorSubject<any[]>([]);

  public newChatMessagesCount = new BehaviorSubject<number>(0);

  private baseUrl = `${environment.chatCoreUrl}/chat`;
  private baseChatGroupUrl = `${environment.chatCoreUrl}/chatGroups`;
  private baseAuthUrl = `${environment.chatCoreUrl}/auth`;

  public chatGroups: ChatGroupUsernameDTO[] = [];
  public authUsers: Auth[] = [];

  public guid = '';

  constructor(
    private datePipe: DatePipe,
    private messageService: MessageService,
    private httpClient: HttpClient,
    private loginService: LoginService,
    private deviceService: DeviceDetectorService) { }

    async postChatGroup(chatGroupUserIds: number[]) {
      await this.PostChatGroup(chatGroupUserIds);
    }

    PostChatGroup(chatGroupUserIds: number[]): Promise<Auth[]> {
      return new Promise((res, rej) => {
        const url = `${this.baseChatGroupUrl}/AddChatGroup`;
        this.httpClient.post<any>(url, chatGroupUserIds).subscribe(
          {
            next: (users: any) => {   
              res([]);
            },
            error: (err: any) => {
              res([]);
            }
          }
        );
      });
    }

    async getAuthUsers() {
      const authUsers = await this.GetAuthUsers();
      this.authUsers = authUsers;
    }

    GetAuthUsers(): Promise<Auth[]> {
      return new Promise((res, rej) => {
        const url = `${this.baseAuthUrl}/GetUsers`;
        this.httpClient.get<String[]>(url).subscribe(
          {
            next: (users: any[]) => {   
              const authUsers: Auth[] = [];
              for (const user of users) {
                var authUser = new Auth()
                authUser.id = user.id;
                authUser.username = user.username
                authUsers.push(authUser);
              }
              res(authUsers);
            },
            error: (err: any) => {
              res([]);
            }
          }
        );
      });
    }

    async getChatGroups() {
      const chatGroups = await this.GetChatGroups();
      this.chatGroups = chatGroups;
    }

    GetChatGroups(): Promise<ChatGroupUsernameDTO[]> {
      return new Promise((res, rej) => {
        const url = `${this.baseChatGroupUrl}/GetChatGroupsById/${this.loginService.usernameId}`;
        this.httpClient.get<String[]>(url).subscribe(
          {
            next: (chatGroupsByUser: any[]) => {   
              const chatGroupUsernames: ChatGroupUsernameDTO[] = []
              for (const chatGroupByUser of chatGroupsByUser) {
                var chatGroupForUser = new ChatGroupUsernameDTO()
                chatGroupForUser.Guid = chatGroupByUser.guid;
                chatGroupForUser.Usernames = chatGroupByUser.usernames
                chatGroupUsernames.push(chatGroupForUser);
              }
              res(chatGroupUsernames);
            },
            error: (err: any) => {
              res(null);
            }
          }
        );
      });
    }

  getStoreChats() {
    let chats = [];
    try {
      const localChats = JSON.parse(window.localStorage.getItem(`chatStore:${this.guid}`));
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

  updateStoreChats(chats: Chat[]) {
    chats = this.filterInvalidChats(chats);
    chats.sort((a, b) => a.Id - b.Id);

    const oldChats = this.getStoreChats();
    if (this.chatMessages.length !== 0 && oldChats.length === chats.length)
      return;

    window.localStorage.setItem(`chatStore:${this.guid}`, JSON.stringify(chats.flat()));
    this.chatMessages = chats;

    const chatMessagesByDateDict = {};
    for (const chat of chats) {
      const date = new Date(chat.Datetime).toDateString();
      if (!chatMessagesByDateDict.hasOwnProperty(date))
        chatMessagesByDateDict[date] = [chat];      
      else
        chatMessagesByDateDict[date].push(chat);
    }

    const dates = Object.keys(chatMessagesByDateDict);
    dates.sort((a, b) => { return parseInt(a) - parseInt(b) });

    let chatMessagesByDate = [];

    for (const date of dates) {
      const dateChat = new Chat();
      dateChat.Id = 99999999;
      dateChat.Who = 'date';
      dateChat.Content = date;
      dateChat.Datetime = 0;

      chatMessagesByDate.push(dateChat);
      chatMessagesByDate.push(chatMessagesByDateDict[date]);
    }
    chatMessagesByDate = chatMessagesByDate.flat();

    this.chatMessagesByDateSubject.next(chatMessagesByDate);
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
        const isDektop = this.deviceService.isDesktop();
        for (let i = 0; i < newChats.length; i++) {
          if (isDektop && i < 5) {
            const newChat = newChats[i];
            new Notification('New chat message', {
              body: `${newChat.Who}: ${newChat.Content}`,
            });
          }
        }
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
      name: !this.loginService.username ? 'unknown' : this.loginService.username,
      message: message,
      guid: this.guid
    }));

    this.addStoreChat(chat);
    this.messageService.add(`ChatService: Posted chat message id ${chat.Id}.`);
  }

  GetChatsAfterId(id: number): Promise<any[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetChatsAfterId?id=${id}&guid=${this.guid}`;
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
            chat.Guid = chatObject.guid;

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
      const url = `${this.baseUrl}/GetChats?guid=${this.guid}`;
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
