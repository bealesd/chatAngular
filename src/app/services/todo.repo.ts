import { Injectable } from '@angular/core';

import { MessageService } from '../services/message.service';
import { FileApi, FileApiFactory } from './file-api';
import { NotepadMetadata } from '../models/notepad-models';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoRepo {
  public todoList: Todo[] = [];
  fileApi: FileApi;

  constructor(
    private messageService: MessageService,
    private fileApiFactory: FileApiFactory) {
    this.fileApi = this.fileApiFactory.create();
    this.fileApi.dir = '/todoStore';
  }

  async postTodoItemRest(todoItemList: {}[]): Promise<NotepadMetadata> {
    return await this.fileApi.editFileAsync('todo.json', JSON.stringify(todoItemList))
  }

  async deleteItem(id): Promise<void> {
    this.messageService.add(`Deleting todo item: ${id}.`);

    const todoList = this.todoList.filter(t => t.id !== id);

    const result = await this.postTodoItemRest(todoList)
    if (!result)
      this.messageService.add(`TodoRepo: Failed to delete todo item for ${id}.`, 'error');
    else {
      this.todoList = todoList;
      this.messageService.add(`TodoRepo: Deleted todo item for ${id}.`);
    }
  }

  async updateItem(id, text, complete): Promise<void> {
    this.messageService.add(`Updating todo item: ${id}.`);

    const item = this.todoList.find(t => t.id === id);
    const oldText = item.text;
    const oldComplete = item.complete;
    item.text = text;
    item.complete = complete;

    const result = await this.postTodoItemRest(this.todoList)
    if (!result) {
      item.text = oldText;
      item.complete = oldComplete;
      this.messageService.add(`TodoRepo: Failed to update todo item for ${id}.`, 'error');
    }
    else
      this.messageService.add(`TodoRepo: Updated todo item for ${id}.`);
  }

  async postNewItem(text): Promise<void> {
    this.messageService.add(`Posting todo item: ${text}.`);

    const ids = this.todoList.map(t => t.id);
    let id = 1
    if (ids.length > 0)
      id = Math.max(...Object.values(this.todoList.map(t => t.id))) + 1;

    this.todoList.push({ id: id, text: text, complete: false, datetime: new Date()});

    let isPosted = await this.postTodoItemRest(this.todoList);
    if (!isPosted) {
      this.todoList = this.todoList.filter(item => item.id !== id);
      this.messageService.add(`TodoRepo: Failed to post todo item for ${id}.`, 'error');
    }
    else
      this.messageService.add(`TodoRepo: Posted todo item for ${id} with text ${text}.`);
  }

  async getTodoList(): Promise<void> {
    this.messageService.add(`Getting todo list.`);

    let file = await this.fileApi.getFileAsync('todo.json');
    if (file) {
      const todoList: Todo[] = [];
      JSON.parse(file).forEach(item => todoList.push(item));
      this.todoList = todoList;
      this.messageService.add(`TodoRepo: Got ${todoList.length} todo items.`);
    }
    else {
      this.messageService.add(`TodoRepo: failed to get todo items.`, 'error');
    }
  }

}
