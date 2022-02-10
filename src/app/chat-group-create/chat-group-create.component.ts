import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat-group-create',
  templateUrl: './chat-group-create.component.html',
  styleUrls: ['./chat-group-create.component.css']
})
export class ChatGroupCreateComponent implements OnInit {
  userIds = [];
  
  constructor(public chatService: ChatService) { }

  ngOnInit(): void {
    window['pageTitle'] = 'Create Chat Group';
    window['toolInfo'] = '';
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
    if (this.formStatus =='invalid'){
      alert('No One was Selected!');
      return;
    }
    await this.chatService.postChatGroup(this.userIds);
    alert("New Group Created");
    this.chatService.getChatGroups();
  }

}
