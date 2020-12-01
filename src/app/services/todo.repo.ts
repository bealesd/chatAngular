import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GitHubMetaData } from '../models/gitHubMetaData'
import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from '../services/message.service';

@Injectable({
  providedIn: 'root'
})
export class TodoRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/todoStore/contents';
  public todoList = [];
  public sha = '';

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
  }

  postTodoItemRest(todoItemList: {}[]): Observable<any> {
    const postUrl = `${this.baseMessagesUrl}/todo.json`;

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by todo list wesbite at ${new Date().toLocaleString()}`,
      "content": btoa(btoa(JSON.stringify(todoItemList))),
      'sha': this.sha
    });

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.restHelper.options());
  }

  deleteItem(id): void {
    this.messageService.add(`Deleting todo item: ${id}.`);

    let todoList = this.todoList;

    todoList = todoList.filter(t => t.id !== id);

    this.postTodoItemRest(todoList).subscribe(
      {
        next: (calendarRecordsResult: any[]) => {
          this.sha = (<any>calendarRecordsResult).content.sha;
          this.todoList = todoList;

          this.messageService.add(` • Deleted todo item for ${id}.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `deleting todo item for ${id}.`, 'TodoRepo');
        }
      }
    );
  }

  updateItem(id, text, complete): void {
    this.messageService.add(`Updating todo item: ${id}.`);

    let todoList = this.todoList;

    let item = this.todoList.find(t => t.id === id);
    item.text = text;
    item.complete = complete;

    this.postTodoItemRest(todoList).subscribe(
      {
        next: (calendarRecordsResult: any[]) => {
          this.sha = (<any>calendarRecordsResult).content.sha;
          this.todoList = todoList;

          this.messageService.add(` • Updated todo item for ${id}.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `updating todo item for ${id}.`, 'TodoRepo');
        }
      }
    );
  }

  postNewItem(text): void {
    this.messageService.add(`Posting todo item: ${text}.`);

    let todoList = this.todoList;

    const ids = todoList.map(t => t.id)
    let id = 1
    if (ids.length > 0)
      id = Math.max(...Object.values(todoList.map(t => t.id))) + 1;

    todoList.push({ id: id, text: text, complete: false });

    this.postTodoItemRest(todoList).subscribe(
      {
        next: (calendarRecordsResult: any[]) => {
          this.sha = (<any>calendarRecordsResult).content.sha;
          this.todoList = todoList;

          this.messageService.add(` • Posted todo item for ${id} with text ${text}.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `posting todo item for ${id} with text ${text}.`, 'TodoRepo');
        }
      }
    );
  }

  getTodoList(): void {
    this.messageService.add(`Getting todo list.`);

    const getUrl = `${this.baseMessagesUrl}/todo.json`;

    let todoList = [];
    this.http.get<[]>(this.restHelper.removeUrlParams(getUrl), this.restHelper.options())
      .subscribe(
        {
          next: (todoGitHub: any) => {
            JSON.parse(atob(atob(todoGitHub.content))).forEach(item => todoList.push(item));
            this.todoList = todoList;
            this.sha = todoGitHub.sha;

            this.messageService.add(` • Got ${todoList.length} todo items.`);
          },
          error: (err: any) => {
            this.todoList = todoList;

            if (err.status === 404 && err.statusText.toLowerCase() === 'not found' && err.error.message === 'This repository is empty.') {
              this.messageService.add(` • Creating file: todo.json.`);
              this.postTodoItemRest([]).subscribe(
                {
                  next: (calendarRecordsResult: any[]) => {
                    this.sha = (<any>calendarRecordsResult).content.sha;
                    this.messageService.add(` • Created todo.json.`);
                  },
                  error: (err: any) => {
                    this.restHelper.errorMessageHandler(err, `creating todo.json.`, 'TodoRepo');
                  }
                }
              );
            }
            else
              this.restHelper.errorMessageHandler(err, 'getting todo list', 'TodoRepo');
          }
        }
      );
  }

}
