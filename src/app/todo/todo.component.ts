import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todoList = [
    { id: 6, text: 'tennis' },
    { id: 1, text: 'swimming' },
    { id: 2, text: 'jogging' }
  ];

  get sortedTodoList() {
    return this.todoList.sort((a, b) => {
      return a.id - b.id;
    });
  }

  constructor() { }

  ngOnInit(): void {
    document.querySelector('body').classList.remove('dark');
    document.querySelector('body').classList.add('todo');
  }

  deleteTodo(todo) {

  }

  addTodo() {
    const value = (<HTMLInputElement>document.querySelector('.todo-input')).value;
    // Math.max(  O
    const id = Math.max(...Object.values(this.todoList.map(t => t.id))) + 1;
    this.todoList.push({id: id, text: value});

    (<HTMLInputElement>document.querySelector('.todo-input')).value = '';
  }

  markTodoAsDone(todo) {

  }

}
