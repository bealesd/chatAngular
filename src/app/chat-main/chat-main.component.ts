import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  messageContainerScrolledToBottom = true;
  messageChangeCount = 0;
  usernames: string[] = [];

  chatInputClass = 'text-input';

  constructor(
    public chatService: ChatService,
    private messageService: MessageService,
    public loginService: LoginService,
    public profileService: ProfileService,
    private activatedRoute: ActivatedRoute
  ) {
    this.messageInput = '';
    this.rows = 1;
    this.messagesContainer = '.messagesContainer';
    this.chatMessages = [];

    this.chatService.chatMessages = [];
    this.chatService.chatMessagesByDate = [];
    this.chatService.chatMessagesByDateSubject.next([]);
    this.chatService.newChatMessagesCount.next(0);
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'PageDown':
      case 'PageUp':
        this.messageContainerScrolledToBottom = this.isMessageContainerScrolledToBottom();
        break
    }
  }

  @HostListener('window:wheel', ['$event'])
  handleWheelScroll(e: WheelEvent) {
    this.messageContainerScrolledToBottom = this.isMessageContainerScrolledToBottom();
  }

  @HostListener('window:blur', ['$event'])
  registerTabSwitch(e: Event) {
    this.chatService.newChatMessagesCount.next(0);
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const guid = params['guid'];
      this.chatService.guid = guid;

      this.usernames = params['usernames'];
    });

    // this.activatedRoute.queryParams
    //   .filter(params => params.order)
    //   .subscribe(params => {
    //     console.log(params); // { order: "popular" }
    //   }
    // );

    this.chatService.newChatMessagesCount
      .subscribe(newChatMessagesCount => {
        this.newChatMessagesCount = newChatMessagesCount;
      });

    this.newChatMessagesCount = 0;

    this.chatService.chatMessagesByDateSubject
      .subscribe(chatMessages => {
        this.chatMessages = chatMessages;
      });

    this.chatService.getChatMessages().then(() => {
      // this.scrollToBottom();
      this.setGroupProfile();
    });

    this.subscriptions
      .push(interval(this.secsToMilliSecs(20))
        .subscribe(x => this.chatService.getChatMessages()));
  }

  ngAfterViewChecked() {
    const oldCount = this.messageChangeCount;
    this.messageChangeCount = document.querySelector('.messages-list').childElementCount;
    if (oldCount !== this.messageChangeCount && this.messageContainerScrolledToBottom)
      this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chatService.newChatMessagesCount.observers.forEach(element => { element.complete(); });
    this.chatService.chatMessagesByDateSubject.observers.forEach(element => { element.complete(); });

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    this.messageInput = (<any>document.querySelector(`.${this.chatInputClass}`)).innerText;
  }

  scrollToBottom(stop = false): void {
    if (stop === true) return;

    const messagesContainer = document.querySelector('.messagesContainer');
    if (messagesContainer === null) {
      setTimeout(() => { this.scrollToBottom(true) }, 200);
      return;
    }

    const messageHeightOutOfView = messagesContainer.scrollHeight - messagesContainer.clientHeight;
    const messageContainerScrolledToBottom = messagesContainer.scrollTop === messageHeightOutOfView;

    if (messageHeightOutOfView > 0 && !messageContainerScrolledToBottom)
      messagesContainer.scrollTop = messageHeightOutOfView;
  }

  isMessageContainerScrolledToBottom(): boolean {
    const messagesContainer = document.querySelector('.messagesContainer');
    if (messagesContainer === null)
      return false;

    const messageHeightOutOfView = messagesContainer.scrollHeight - messagesContainer.clientHeight;
    return messagesContainer.scrollTop === messageHeightOutOfView;
  }

  setGroupProfile() {
    this.groupMembers = this.usernames;

    for (const member of this.groupMembers) 
      this.setImageSource(member);  
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
