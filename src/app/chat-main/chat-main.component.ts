import { Component, OnInit, OnDestroy } from '@angular/core';

import { interval, Subscription } from 'rxjs';

import { Chat } from '../models/chat.model';

import { ChatService } from '../services/chat.service';
import { LoginService } from '../services/login.service';
import { MessageService } from '../services/message.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat-main.component.html',
  styleUrls: ['./chat-main.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  chatMessages: Chat[];
  chatForm: Chat;
  messageInput: string;
  rows: number;
  messagesContainer: string;
  getNewChatMessagesInterval: Subscription;
  checkForUpdatedMessagesInterval: Subscription;
  newChatMessagesCount: number;
  groupMembers: string[] = [];

  chatInputClass = 'text-input';

  constructor(
    public chatService: ChatService,
    private messageService: MessageService,
    public loginService: LoginService,
    public profileService: ProfileService
  ) {
    this.messageInput = '';
    this.rows = 1;
    this.messagesContainer = '.messagesContainer';
    this.chatMessages = [];
  }

  ngOnInit(): void {
    this.chatService.newChatMessagesCount
      .subscribe(newChatMessagesCount => {
        this.newChatMessagesCount = newChatMessagesCount;
      });

    this.newChatMessagesCount = 0;

    this.chatService.getChatMessages().then(() => {
      this.scrollToBottom();
      this.setGroupProfile();
    });

    this.subscriptions
      .push(interval(this.secsToMilliSecs(20))
        .subscribe(x => this.chatService.getChatMessages()));

    this.registerTabSwitch();
  }

  ngOnDestroy() {
    this.chatService.newChatMessagesCount.observers.forEach(element => { element.complete(); });

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngDoCheck() {
    // const messagesContainer = document.querySelector(this.messagesContainer);
    // if (messagesContainer && messagesContainer.children.length > 0)
    //   this.scrollToBottom();
  }

  registerTabSwitch() {
    window.addEventListener('blur', () => {
      this.chatService.newChatMessagesCount.next(0);
    })
  }

  postMessage(event) {
    const textInputElement = (<any>document.querySelector(`.${this.chatInputClass}`))
    textInputElement.innerText = "";

    if (this.messageInput === "" || this.messageInput === null || this.messageInput === undefined)
      return this.messageService.add(`Please enter a message before posting.`);

    this.chatService.sendChatMessage(this.messageInput);
    this.messageInput = "";
    textInputElement.focus()
  }

  onMessageTyping(event) {
    this.messageInput = (<any>document.querySelector(`.${this.chatInputClass}`)).innerText
  }

  scrollToBottom(stop = false): void {
    if (stop === true) return;

    const messagesContainer = document.querySelector('.messagesContainer');
    if (messagesContainer === null){
      setTimeout(() => { this.scrollToBottom(true) }, 200);
      return;
    }   
    
    const messageHeightOutOfView = messagesContainer.scrollHeight - messagesContainer.clientHeight;
    const messageContainerScrolledToBottom = messagesContainer.scrollTop === messageHeightOutOfView;

    if (messageHeightOutOfView > 0 && !messageContainerScrolledToBottom)
      messagesContainer.scrollTop = messageHeightOutOfView;
  }

  setGroupProfile() {
    // dirty, hardcoded solution until I implement groups tables
    // TODO: we need to map your profile to chats groups you are in
    // each chat group will map back to to profile ids to get users metadata, and each chat for contain the group chat id to get corr3ct chat messages for group

    if (this.loginService.username === 'esther') {
      this.groupMembers = ['David'];
    }
    else if (this.loginService.username === 'admin') {
      this.groupMembers = ['Esther'];
    }

    for (const member of this.groupMembers) {
      this.setImageSource(member);
    }
  }

  async setImageSource(member: string) {
    const url = await this.profileService.getProfilePicture(member);
    document.querySelector(`#img-${member}`)['src'] = url;
  }

  //helpers

  secsToMilliSecs = (seconds) => { return seconds * 1000 };

  minsToMilliSecs = (minutes) => { return this.secsToMilliSecs(minutes * 60) };

  hoursToMilliSecs = (hours) => { return this.minsToMilliSecs(hours * 60) };
}
