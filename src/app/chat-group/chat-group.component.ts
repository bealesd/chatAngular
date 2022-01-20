import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-group',
  templateUrl: './chat-group.component.html',
  styleUrls: ['./chat-group.component.css']
})
export class ChatGroupComponent implements OnInit {
  userIds = [];

  constructor(public chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.getChatGroups();
    this.chatService.getAuthUsers().then(() => { });
  }

  validateForm(evt) {
    if (evt.srcElement.classList.contains('checkmark-label'))
      evt.srcElement.previousElementSibling.click();
     
    this.userIds = [];

    document.querySelectorAll('.checkmark').forEach((checkbox: HTMLInputElement) => {
      if (checkbox.checked) {
        const userId = parseInt(checkbox.value);
        this.userIds.push(userId);
        checkbox.nextSibling['classList'].add('selected');
      }
      else{
        checkbox.nextSibling['classList'].remove('selected');
      }
    });
  }

  get formStatus(){
    return this.userIds.length === 0 ? 'invalid' : 'valid'
  }

  async onSubmit() {
    await this.chatService.postChatGroup(this.userIds);
    alert("New Group Created");
    this.chatService.getChatGroups();
  }
}
