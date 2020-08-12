import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { MessageService } from './message.service';

import { RecieveChat, SendChat } from './chatObject'

import { ChatRepo } from './chatRepo'

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  RecievedChats: RecieveChat[] = [
    { Id: "1", Who: 'esther', Datetime: 1597149968032, Content: "hello" }
  ]

  constructor(private messageService: MessageService, private chatRepo: ChatRepo) {

  }

  getChatMessages(): Observable<RecieveChat[]> {
    // TODO: send the message _after_ fetching the heroes
    this.messageService.add('ChatService: fetched chat messages');
    return this.chatRepo.getLastTen();
  }

}
