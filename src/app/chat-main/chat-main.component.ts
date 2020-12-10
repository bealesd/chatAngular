import { Component, OnInit, OnDestroy } from '@angular/core';

import { interval, Subscription } from 'rxjs';

import { Chat, ChatContainer } from '../models/chat.model';

import { ChatService } from '../services/chat.service';
import { MessageService } from '../services/message.service';

// import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat-main.component.html',
  styleUrls: ['./chat-main.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  chatMessages: ChatContainer[];
  chatForm: Chat;
  content: string;
  rows: number;
  messageContainer: string;
  getNewChatMessagesInterval: Subscription;
  checkForUpdatedMessagesInterval: Subscription;
  newChatMessagesCount: number;

  showEmojiPicker = false;
  sets = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger'
  ]
  set = 'twitter';

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    // private menuService: MenuService
  ) {
    this.content = '';
    this.rows = 1;
    this.messageContainer = '.messagesContainer';
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

    // this.menuService.activateRoute('chat-click');
  }

  ngOnDestroy() {
    this.chatService.chatMessages.observers.forEach(element => { element.complete(); });
    this.chatService.newChatMessagesCount.observers.forEach(element => { element.complete(); });

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngDoCheck() {
    const messageContainer = document.querySelector(this.messageContainer);
    if (messageContainer && messageContainer.children.length > 0)
      this.scrollToBottom();
  }

  registerTabSwitch() {
    window.addEventListener('blur', () => {
      this.chatService.newChatMessagesCount.next(0);
    })
  }

  postMessage(event) {
    event.srcElement.parentElement.querySelector('input').value = "";

    if (this.content === "" || this.content === null || this.content === undefined) 
      return this.messageService.add(`Please enter a message before posting.`);
    
    this.chatService.sendChatMessage(this.content);
    this.content = "";
    event.srcElement.parentElement.querySelector('input').focus();
  }

  onMessageTyping(event) {
    this.content = event.srcElement.parentElement.querySelector('input').value;
  }

  scrollToBottom(): void {
    let messagesContainer = document.querySelector('.messagesContainer');
    if (messagesContainer.scrollHeight - messagesContainer.clientHeight > 0) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event) {
    const emoji = `${event.emoji.native}`;
    const chatMessage = <HTMLInputElement>document.querySelector('#chatMessage');
    chatMessage.value = chatMessage.value + emoji;
    this.content = chatMessage.value;
    this.showEmojiPicker = false;
  }

  //helpers

  secsToMilliSecs = (seconds) => { return seconds * 1000 };

  minsToMilliSecs = (minutes) => { return this.secsToMilliSecs(minutes * 60) };

  hoursToMilliSecs = (hours) => { return this.minsToMilliSecs(hours * 60) };
}
