import { Injectable } from '@angular/core';

import { MessageService } from '../services/message.service';
import { FileApi, FileApiFactory } from './file-api';
import { ItemMetadata } from '../models/item-models';
import { Todo, TodoContainer } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoRepo {
  public todo: TodoContainer;
  fileApi: FileApi;

  constructor(
    private messageService: MessageService,
    private fileApiFactory: FileApiFactory) {
    this.fileApi = this.fileApiFactory.create();
    this.fileApi.dir = '/todoStore';

    this.todo = new TodoContainer();
    this.todo.metadata = null;
    this.todo.todos = [];
  }

  async getFile(name: string): Promise<ItemMetadata> {
    const files = await this.fileApi.listFilesAndFoldersAsync();
    if (files === [] || files === null) return null;

    const file = files.find((file) => file.name === name);
    if (file === null || file === undefined) return null;
    return file;
  }

  async postTodoItemRest(todoItemList: {}[]): Promise<ItemMetadata> {
    return await this.fileApi.editFileAsync(this.todo.metadata.key, JSON.stringify(todoItemList))
  }

  async deleteItem(id): Promise<void> {
    this.messageService.add(`Deleting todo item: ${id}.`);

    const todoList = this.todo.todos.filter(t => t.id !== id);

    const result = await this.postTodoItemRest(todoList);
    if (!result)
      this.messageService.add(`TodoRepo: Failed to delete todo item for ${id}.`, 'error');
    else {
      this.todo.todos = todoList;
      this.messageService.add(`TodoRepo: Deleted todo item for ${id}.`);
    }
  }

  async updateItem(id, text, complete): Promise<void> {
    this.messageService.add(`Updating todo item: ${id}.`);

    const item = this.todo.todos.find(t => t.id === id);
    const oldText = item.text;
    const oldComplete = item.complete;
    item.text = text;
    item.complete = complete;

    const result = await this.postTodoItemRest(this.todo.todos)
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

    const ids = this.todo.todos.map(t => t.id);
    let id = 1
    if (ids.length > 0)
      id = Math.max(...Object.values(this.todo.todos.map(t => t.id))) + 1;

    this.todo.todos.push({ id: id, text: text, complete: false, datetime: new Date() });

    let isPosted = await this.postTodoItemRest(this.todo.todos);
    if (!isPosted) {
      this.todo.todos = this.todo.todos.filter(item => item.id !== id);
      this.messageService.add(`TodoRepo: Failed to post todo item for ${id}.`, 'error');
    }
    else
      this.messageService.add(`TodoRepo: Posted todo item for ${id} with text ${text}.`);
  }

  async getTodoList(): Promise<void> {
    this.messageService.add(`Getting todo list.`);

    const file = await this.getFile('todo.json');
    if(file === null || file === undefined) return null
    
    this.todo.metadata = file;
    const content = await this.fileApi.getFileAsync(file.key);

    if (content) {
      const todoList: Todo[] = [];
      JSON.parse(content).forEach(item => {
        todoList.push(item)
      });
      this.todo.todos = todoList;
      this.messageService.add(`TodoRepo: Got ${todoList.length} todo items.`);
    }
    else {
      this.messageService.add(`TodoRepo: failed to get todo items.`, 'error');
    }
  }

}
