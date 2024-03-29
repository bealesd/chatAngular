import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-group',
  templateUrl: './chat-group.component.html',
  styleUrls: ['./chat-group.component.css']
})
export class ChatGroupComponent implements OnInit {
  constructor(public chatService: ChatService) { }

  ngOnInit(): void {
    window['pageTitle'] = 'Chat Groups';
    window['toolInfo'] = '';
    this.chatService.getChatGroups();
    this.chatService.getAuthUsers().then(() => { });
  }

  over(e: Event){
    window['toolInfo'] = e.target['title'] ?? '' ;
   }

   out(){
    window['toolInfo'] = '' ;
  }

  
}
