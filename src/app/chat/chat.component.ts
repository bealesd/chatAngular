import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';

import { interval, Subscription, VirtualTimeScheduler } from 'rxjs';

import { RecieveChat, SendChat } from '../chatObject';

import { ChatService } from './../chat.service';
import { MessageService } from './../message.service';

import { CryptoService } from '../auth/cryptoService';
import { LoginHelper } from '../login/loginHelper'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  chatMessages: RecieveChat[];
  chatForm: SendChat;
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
    private cryptoService: CryptoService,
    private router: Router,
    private loginHelper: LoginHelper
  ) {
    this.content = '';
    this.rows = 1;
    this.messageContainer = '.messagesContainer';
    this.chatMessages = [];

    this.chatService.chatMessages.subscribe(chatMessages => {
      this.chatMessages = chatMessages;
    })

    this.chatService.newChatMessagesCount.subscribe(newChatMessagesCount => {
      this.newChatMessagesCount = newChatMessagesCount;
    })
  }

  ngOnInit(): void {
    this.newChatMessagesCount = 0;

    if (!this.loginHelper.checkPersonSelected()) {
      this.loginHelper.setPerson();
    }
    this.chatService.getChatMessages()

    this.getNewChatMessagesInterval = interval(this.secsToMilliSecs(20)).subscribe(x => this.chatService.getNewChatMessages());
    this.checkForUpdatedMessagesInterval = interval(this.minsToMilliSecs(5)).subscribe(x => this.chatService.checkForUpdatedMessages());

    this.registerTabSwitch();
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

    const newMessage = <SendChat>{ Who: this.loginHelper.who, Content: this.content }

    this.chatService.sendChatMessage(newMessage).subscribe((chatMessage) => {
      this.chatMessages.push(chatMessage);
      this.messageService.add(` • Posted chat message id ${chatMessage.Id}.`);
    });

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

  logout() {
    if (confirm('Do you want to logout?')) {
      this.cryptoService.logout();

      this.getNewChatMessagesInterval.unsubscribe();
      this.checkForUpdatedMessagesInterval.unsubscribe();

      this.messageService.add('Logged out.');
      this.router.navigate(['login']);
    }
  }

  //helpers

  secsToMilliSecs = (seconds) => { return seconds * 1000 };

  minsToMilliSecs = (minutes) => { return this.secsToMilliSecs(minutes * 60) };

  hoursToMilliSecs = (hours) => { return this.minsToMilliSecs(hours * 60) };
}
