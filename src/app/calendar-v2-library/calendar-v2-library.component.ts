import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar-v2-library',
  templateUrl: './calendar-v2-library.component.html',
  styleUrls: ['./calendar-v2-library.component.css']
})
export class CalendarV2LibraryComponent implements OnInit{
  constructor(
    // public todoRepo: TodoRepo,
  ) { }

  async ngOnInit() {
    window['pageTitle'] = 'Todo List';
    window['toolInfo'] = ''
    // await this.todoRepo.getTodoList();
  }
}
