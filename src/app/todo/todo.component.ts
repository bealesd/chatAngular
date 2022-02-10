import { Component, OnInit } from '@angular/core';
import { Todo } from '../models/todo.model';
import { TodoRepo } from '../services/todo.repo'

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})

export class TodoComponent implements OnInit {
  get sortedTodoList() {
    //TODO sought by date
    return this.todoRepo.todos.sort((a:Todo, b:Todo) => {
      return a.id - b.id;
    });
  }

  constructor(
    public todoRepo: TodoRepo,
  ) { }

  async ngOnInit() {
    window['pageTitle'] = 'Todo List';
    window['toolInfo'] = ''
    await this.todoRepo.getTodoList();
  }

  deleteTodo(todo) {
    this.todoRepo.deleteTodo(todo.id);
  }

  addTodo() {
    const text = (<HTMLInputElement>document.querySelector('.todo-input')).value;
    (<HTMLInputElement>document.querySelector('.todo-input')).value = '';
    this.todoRepo.postTodo(text);
  }

  markTodoAsDone(todo) {
    todo.complete = todo.complete === 0 ? 1 : 0;
    this.todoRepo.updatetodo(todo);
  }

}
