import { Component, OnInit, OnDestroy } from '@angular/core';

import { interval, Subscription } from 'rxjs';

import { Chat, ChatContainer } from '../models/chat.model';

import { ChatService } from '../services/chat.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat-main.component.html',
  styleUrls: ['./chat-main.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  chatMessages: ChatContainer[];
  chatForm: Chat;
  messageInput: string;
  rows: number;
  messagesContainer: string;
  getNewChatMessagesInterval: Subscription;
  checkForUpdatedMessagesInterval: Subscription;
  newChatMessagesCount: number;

  chatInputClass = 'input';

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
  ) {
    this.messageInput = '';
    this.rows = 1;
    this.messagesContainer = '.messagesContainer';
    this.chatMessages = [];
  }

  ngOnInit(): void {
    //TODO remove behaviour subject
    this.chatService.chatMessages.subscribe(chatMessages => {
      this.chatMessages = chatMessages;
    })

    this.chatService.newChatMessagesCount.subscribe(newChatMessagesCount => {
      this.newChatMessagesCount = newChatMessagesCount;
    });

    this.newChatMessagesCount = 0;

    this.chatService.getChatMessages();

    this.subscriptions.push(interval(this.secsToMilliSecs(20)).subscribe(x => this.chatService.getNewChatMessages()));
    this.subscriptions.push(interval(this.minsToMilliSecs(5)).subscribe(x => this.chatService.checkForUpdatedMessages()));

    this.registerTabSwitch();
  }

  ngOnDestroy() {
    this.chatService.chatMessages.observers.forEach(element => { element.complete(); });
    this.chatService.newChatMessagesCount.observers.forEach(element => { element.complete(); });

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngDoCheck() {
    const messagesContainer = document.querySelector(this.messagesContainer);
    if (messagesContainer && messagesContainer.children.length > 0)
      this.scrollToBottom();
  }

  registerTabSwitch() {
    window.addEventListener('blur', () => {
      this.chatService.newChatMessagesCount.next(0);
    })
  }

  postMessage(event) {
    event.srcElement.parentElement.querySelector(`.${this.chatInputClass}`).innerText = "";

    if (this.messageInput === "" || this.messageInput === null || this.messageInput === undefined)
      return this.messageService.add(`Please enter a message before posting.`);

    this.chatService.sendChatMessage(this.messageInput);
    this.messageInput = "";
    event.srcElement.parentElement.querySelector(`.${this.chatInputClass}`).focus();
  }

  onMessageTyping(event) {
    const divInput = event.srcElement.parentElement.querySelector(`.${this.chatInputClass}`);
    const oldMessageInput = this.messageInput;
    this.messageInput = divInput.innerText;

    while (divInput.offsetHeight > (124 - (1 * 2))) {
      divInput.innerText = oldMessageInput;
    }
  }

  scrollToBottom(): void {
    let messagesContainer = document.querySelector('.messagesContainer');
    if (messagesContainer.scrollHeight - messagesContainer.clientHeight > 0)
      messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
  }

  //helpers

  secsToMilliSecs = (seconds) => { return seconds * 1000 };

  minsToMilliSecs = (minutes) => { return this.secsToMilliSecs(minutes * 60) };

  hoursToMilliSecs = (hours) => { return this.minsToMilliSecs(hours * 60) };
}
