import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

import { RecieveChat, SendChat } from '../chatObject';

import { ChatService } from '../chat.service';
import { MessageService } from '../message.service';

import { interval } from 'rxjs';

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
  names: string[];
  messageContainer: string;



  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
  ) {
    this.content = '';
    this.rows = 1;
    this.names = ['Esther', 'David'];
    this.messageContainer = '.messagesContainer';

    this.chatService.chatMessages.subscribe(val => {
      this.chatMessages = val;
    })
  }

  ngOnInit(): void {
    this.chatService.getChatMessages();
    interval(10000).subscribe(x => this.chatService.getNewChatMessages());
    interval(100000).subscribe(x => this.chatService.checkForUpdatedMessages());

    this.setPerson();
  }

  // ngAfterViewChecked  (): void{ this.scrollToBottom(); }
  ngDoCheck() {
    const messageContainer = document.querySelector(this.messageContainer);
    if (messageContainer && messageContainer.children.length > 0)
      this.scrollToBottom();
  }

  setPerson() {
    let chatPerson = window.localStorage.getItem('chatPerson');
    if (chatPerson === null || chatPerson === undefined || !this.names.includes(chatPerson))
      chatPerson = 'Esther';

    this.changePerson(chatPerson);
  }

  updatePerson(chatPerson) {
    if (!this.names.includes(chatPerson))
      return;
    else
      window.localStorage.setItem('chatPerson', chatPerson);
  }

  changePerson(event) {
    this.who = event;
    this.updatePerson(this.who);

    document.body.className = '';
    if (this.who === 'David') {
      document.body.classList.add('dark');
    }
    else {
      document.body.classList.add('light');
    }
  }

  postMessage(event) {
    event.srcElement.parentElement.querySelector('input').value = "";

    let newMessage = new SendChat(this.who, this.content);
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
  message = '';

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
}
