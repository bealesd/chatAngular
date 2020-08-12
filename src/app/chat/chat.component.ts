import { Component, OnInit } from '@angular/core';
import { FormsModule, Validators, FormControl, FormGroup } from '@angular/forms';

import { RecieveChat, SendChat } from '../chatObject';

import { ChatService } from '../chat.service';

import { MessageService } from '../message.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatMessages: RecieveChat[];
  chatForm: SendChat;
  test: any;
  content: string;

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
  ) {

  }

  ngOnInit(): void {
    this.getChatMessage();
    this.content = '';
  }

  getChatMessage(): void {
    this.chatService.getChatMessages()
      .subscribe((chatMessages) => {
        this.chatMessages = chatMessages;
      });
  }

  onClickSubmit(data) {
    alert("Entered Email id : " + data.chatMessage);
  }

  public send(event) {
    event.srcElement.parentElement.querySelector('textarea').value = "";
    console.log(this.content);

    //send message here

    this.content = "";
    event.srcElement.parentElement.querySelector('textarea').focus();
  }

  onMessageTyping(event) {
    this.content = event.srcElement.parentElement.querySelector('textarea').value;
    console.log(this.content);
  }

}