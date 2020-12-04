import { Component, OnInit } from '@angular/core';
import { Todo } from '../models/todo.model';
import { MenuService } from '../services/menu.service';
import { TodoRepo } from '../services/todo.repo'

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})

export class TodoComponent implements OnInit {
  get sortedTodoList() {
    //TODO sought by date
    return this.todoRepo.todoList.sort((a:Todo, b:Todo) => {
      return a.id - b.id;
    });
  }

  constructor(
    public todoRepo: TodoRepo,
    public menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.todoRepo.getTodoList();
    this.menuService.activateRoute('todo-click');
  }

  deleteTodo(todo) {
    this.todoRepo.deleteItem(todo.id);
  }

  addTodo() {
    const text = (<HTMLInputElement>document.querySelector('.todo-input')).value;
    (<HTMLInputElement>document.querySelector('.todo-input')).value = '';
    this.todoRepo.postNewItem(text);
  }

  markTodoAsDone(todo) {
    todo.complete = !todo.complete;
    this.todoRepo.updateItem(todo.id, todo.text, todo.complete);
  }

}
