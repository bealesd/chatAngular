import { Component, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-component',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {
  calendarError = false;
  chatError = false;
  todoError = false;
  notepadError = false;

  constructor(private menuSerivce: MenuService) { }

  ngOnInit(): void {
    this.menuSerivce.activateRoute('home-click');
  }

  customAlert(message) {
    alert(message);
  }

  fallback(evt) {
    if (evt.target.title.toLowerCase() === 'calendar')
      this.calendarError = true;
    else if (evt.target.title.toLowerCase() === 'chat')
      this.chatError = true;
    else if (evt.target.title.toLowerCase() === 'todo')
      this.todoError = true;
    else if (evt.target.title.toLowerCase() === 'notepad')
        this.notepadError = true;
    }

  }
