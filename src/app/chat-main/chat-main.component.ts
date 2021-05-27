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
  limitRows = 10;
  messageLastScrollHeight: number;

  subscriptions: Subscription[] = [];

  chatMessages: ChatContainer[];
  chatForm: Chat;
  messageInput: string;
  rows: number;
  messagesContainer: string;
  getNewChatMessagesInterval: Subscription;
  checkForUpdatedMessagesInterval: Subscription;
  newChatMessagesCount: number;

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

    this.messageLastScrollHeight = document.querySelector('textarea').scrollHeight;
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
    event.srcElement.parentElement.querySelector('textarea').value = "";

    if (this.messageInput === "" || this.messageInput === null || this.messageInput === undefined) 
      return this.messageService.add(`Please enter a message before posting.`);
    
    this.chatService.sendChatMessage(this.messageInput);
    this.messageInput = "";
    event.srcElement.parentElement.querySelector('textarea').focus();
  }

  onMessageTyping(event) {
    const textArea = event.srcElement.parentElement.querySelector('textarea');
    this.messageInput = textArea.value;

    // const carriageReturns = this.messageInput.split('\n').length;
    // const lineHeight = 22;
    // const expectedHeight = lineHeight * carriageReturns;

    // if (textArea.offsetHeight > expectedHeight + 2 || textArea.offsetHeight < expectedHeight -2){
    //   // textArea.style.height = `${expectedHeight}px`;
    // }
    // //expands, does not shrink
    // // textArea.style.height = Math.min(textArea.scrollHeight, 500) + "px";
    
    
    var rows = parseInt(textArea.getAttribute("rows"));

    textArea.setAttribute("rows", "1");
    
    if (rows < this.limitRows && textArea.scrollHeight > this.messageLastScrollHeight) {
        rows++;
    } else if (rows > 1 && textArea.scrollHeight < this.messageLastScrollHeight) {
        rows--;
    }
    
    this.messageLastScrollHeight = textArea.scrollHeight;
    textArea.setAttribute("rows", rows);
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
