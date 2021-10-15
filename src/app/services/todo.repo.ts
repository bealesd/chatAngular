import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../services/message.service';
import { Todo, TodoContainer } from '../models/todo.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoRepo {
  public todo: TodoContainer;
  public todos: Todo[] = [];
  private baseUrl = `${environment.chatCoreUrl}/todo`

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient) {
    this.todo = new TodoContainer();
    this.todo.todos = [];
  }

  GetTodos(): Promise<Todo[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetTodos`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (todosDto: any[]) => {
            const todos: Todo[] = [];
            if (todosDto && todosDto.length > 0) {
              for (let i = 0; i < todosDto.length; i++) {
                const todoDto = todosDto[i];
                const todo = new Todo();
                todo.id = todoDto.id;
                todo.text = todoDto.text;
                todo.complete = todoDto.complete;
                todo.dateTime = todoDto.dateTime;
                todos.push(todo);
              }
            }
            res(todos);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async getTodoList(): Promise<boolean> {
    this.messageService.add(`TodoRepo: Getting all todos.`);
    const todos = await this.GetTodos();
    if (!todos) {
      this.messageService.add('TodoRepo: Getting todos.', 'error');
      return false;
    }
    else {
      this.todos = todos;

      this.messageService.add(`TodoRepo: Got all todos.`);
      return true
    }
  }

  async postTodo(text: string, complete = 0): Promise<boolean> {
    var td = new Todo();
    td.text = text;
    td.complete = complete;

    const todo = await this.PostTodo(td);

    if (!todo) {
      this.messageService.add(`TodoRepo: Posting todo text: ${text}.`, 'error');;
      return false;
    }
    else {
      this.todos.push(todo);
      this.messageService.add(`TodoRepo: Posted todo name: ${todo.id}.`);
      return true;
    }
  }

  PostTodo(todo: Todo): Promise<Todo> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddTodo`;
      this.httpClient.post<any>(url, todo).subscribe(
        {
          next: (todoDto: any) => {
            const todo = new Todo();
            todo.text = todoDto.text;
            todo.complete = todoDto.complete;
            todo.id = todoDto.id;
            todo.dateTime = todoDto.dateTime;

            res(todo);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async updatetodo(td: Todo): Promise<boolean> {
    const todo = await this.UpdateTodo(td);

    if (!todo) {
      this.messageService.add(`TodoRepo: Updating todo id: ${td.id}.`, 'error');;
      return false;
    }
    else {
      this.messageService.add(`TodoRepo: Updated todo id: ${td.id}.`);
      return true;
    }
  }

  UpdateTodo(todo: Todo): Promise<boolean> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/UpdateTodo`;
      this.httpClient.put<any>(url, todo).subscribe(
        {
          next: (todoDto: any) => {
            res(true);
          },
          error: (err: any) => {
            res(false);
          }
        }
      );
    });
  }

  async deleteTodo(id: number): Promise<void> {
    this.messageService.add(`TodoRepo: Deleting todo id: ${id}.`, 'info');

    const result = await this.DeleteTodo(id);
    if (result) {
      const recordsToKeep = this.todos.filter(r => r.id !== id);
      this.todos = recordsToKeep;
      this.messageService.add(`TodoRepo: Deleted todo id: ${id}.`, 'info');
    }
    else {
      this.messageService.add(`TodoRepo: Deleting todo failed: ${id}.`, 'error');
    }
  }

  DeleteTodo(id): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/DeleteTodo?id=${id}`;
      this.httpClient.delete(url).subscribe(
        {
          next: (todoObject: any) => {
            res(true);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }
}
