import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LoginHelper {
  names: string[];
  who: string;

  constructor(
  ) {
    this.names = ['Esther', 'David'];
  }

  changePerson(person) {
    this.who = person;
    this.updatePerson(person);

    document.body.className = '';
    document.body.classList.add('dark');
    // if (this.who === 'David')
    //   document.body.classList.add('dark');
    // else
    //   document.body.classList.add('light');
  }

  updatePerson(chatPerson) {
    if (!this.names.includes(chatPerson))
      return;
    else
      window.localStorage.setItem('chatPerson', chatPerson);
  }

  setPerson() {
    let chatPerson = window.localStorage.getItem('chatPerson');
    if (chatPerson === null || chatPerson === undefined || !this.names.includes(chatPerson))
      chatPerson = 'Esther';

    this.changePerson(chatPerson);
  }

  checkPersonSelected(): boolean {
    if (document.body.className === '' || !this.names.includes(document.body.className)) 
      return false;
    return true;
  }
}
