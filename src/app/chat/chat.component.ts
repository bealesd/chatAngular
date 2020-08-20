import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';

import { interval } from 'rxjs';

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
  who: string;
  messageContainer: string;

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
    // this.names = ['Esther', 'David'];
    this.messageContainer = '.messagesContainer';

    this.chatService.chatMessages.subscribe(val => {
      this.chatMessages = val;
    })
  }

  ngOnInit(): void {
    if(!this.loginHelper.checkPersonSelected()){
      this.loginHelper.setPerson();
    }
    this.chatService.getChatMessages();
    interval(this.secsToMilliSecs(20)).subscribe(x => this.chatService.getNewChatMessages());
    interval(this.minsToMilliSecs(5)).subscribe(x => this.chatService.checkForUpdatedMessages());

    // this.setPerson();
  }

  ngDoCheck() {
    const messageContainer = document.querySelector(this.messageContainer);
    if (messageContainer && messageContainer.children.length > 0)
      this.scrollToBottom();
  }

  secsToMilliSecs = (seconds) => { return seconds * 1000 };

  minsToMilliSecs = (minutes) => { return this.secsToMilliSecs(minutes * 60) };

  hoursToMilliSecs = (hours) => { return this.minsToMilliSecs(hours * 60) };

  postMessage(event) {
    event.srcElement.parentElement.querySelector('input').value = "";

    const newMessage = <SendChat>{ Who: this.who, Content: this.content }

    this.chatService.sendChatMessage(newMessage).subscribe((chatMessage) => {
      this.chatMessages.push(chatMessage);
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

  logout(){
    this.cryptoService.logout();

    this.messageService.add('success');
    this.router.navigate(['login']);
  }
}
