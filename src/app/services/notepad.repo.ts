import { Injectable } from '@angular/core';

import { MessageService } from './message.service';
import { Item, ItemMetadata } from '../models/item-models';
import { FileApiFactory, FileApi } from './file-api';

@Injectable({
  providedIn: 'root'
})
export class NotepadRepo {
  public notepads: Item[] = [];
  public currentNotepadKey: string = '';

  fileAPi: FileApi;
  currentNotepadName: string;

  constructor(
    private messageService: MessageService,
    private fileApiFactory: FileApiFactory) {

    this.fileAPi = this.fileApiFactory.create();
    this.fileAPi.dir = '/notepadStore';
  }

  changeDir(isUp: boolean, relPath: string): boolean {
    return this.fileAPi.changeDir(isUp, relPath);
  }

  get currentDir(){
    return this.fileAPi.dir;
  }

  findNotepad(key) {
    const notepad = this.notepads.find(np => np.metadata.key === key);
    if (!notepad) {
      return null;
    }
    return notepad;
  }

  async getAllNotepads(): Promise<boolean> {
    this.messageService.add(`NotepadRepo: Getting all notepads.`);
    const notepads = await this.fileAPi.listFilesAndFoldersAsync();
    if (!notepads) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      return false;
    }
    else {
      this.notepads = [];
      notepads.forEach((notepadMetadata: ItemMetadata) => {
        if (notepadMetadata.name !== 'dummy.txt') {
          const notepad = new Item();
          notepad.metadata = new ItemMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
          notepad.content = '';
          this.notepads.push(notepad);
        }
      });
      this.messageService.add(`NotepadRepo: Got all notepads.`);
      return true
    }
  }

  async getNotepad(key: string): Promise<boolean> {
    const content = await this.fileAPi.getFileAsync(key);
    if (content === null) {
      this.messageService.add('NotepadRepo: Getting notepad.', 'error');
      return false;
    }
    else {
      this.notepads.find(v => v.metadata.key === key).content = content;
      this.currentNotepadKey = this.notepads.find(v => v.metadata.key === key).metadata.key;
      this.currentNotepadName = this.notepads.find(v => v.metadata.key === key).metadata.name;

      this.messageService.add(`NotepadRepo: Got notepad.`);
      return true;
    }
  }

  async updateNotepad(key: string): Promise<boolean> {
    const notepad = this.findNotepad(key);
    
    const result = await this.fileAPi.editFileAsync(key, notepad.content)
    if (!result) {
      this.messageService.add(`NotepadRepo: Posting notepad sha: ${notepad.metadata.sha}.`, 'error');
      return false;
    }
    else {
      notepad.metadata.sha = result.sha;
      this.currentNotepadKey = notepad.metadata.key;

      this.messageService.add(`NotepadRepo: Posted notepad sha: ${notepad.metadata.sha}.`);
      return true;
    }
  }

  async postNotepad(text: string, name: string): Promise<boolean> {
    const notepadMetadata = await this.fileAPi.newFileAsync(name, text);
    if (!notepadMetadata) {
      this.messageService.add(`NotepadRepo: Posting notepad name: ${name}.`, 'error');
      return false;
    }
    else {
      const notepad = new Item();
      notepad.metadata = new ItemMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
      notepad.content = text;
      this.notepads.push(notepad);

      this.messageService.add(`NotepadRepo: Posted notepad name: ${notepad.metadata.name}.`);
      return true;
    }
  }

  async postFolder(name: string): Promise<boolean> {
    const notepadMetadata = await this.fileAPi.newFolderAsync(name)
    if (!notepadMetadata) {
      this.messageService.add(`NotepadRepo: Posting notepad name: ${name}.`, 'error');;
      return false;
    }
    else {
      const notepad = new Item();
      notepad.metadata = new ItemMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);

      this.messageService.add(`NotepadRepo: Posted notepad name: ${notepad.metadata.name}.`);
      return true;
    }
  }

  async deleteNotepad(key: string): Promise<boolean> {
    const result = await this.fileAPi.deleteFileAsync(key);
    if (!result) {
      this.messageService.add(`NotepadRepo: Deleting notepad ${key}.`, 'error');
      return false;
    }
    else {
      this.notepads = this.notepads.filter(n => n.metadata.key !== key);
      this.messageService.add(`NotepadRepo: Notepad ${key} deleted.`);
      return true;
    }
  }

  async deleteFolder(key: string): Promise<boolean> {
    const result = await this.fileAPi.deleteFolderAsync(key);
    if (!result) {
      this.messageService.add(`NotepadRepo: Deleting folder ${key}.`, 'error');
      return false;
    }
    else {
      this.notepads = this.notepads.filter(n => n.metadata.key !== key);
      this.messageService.add(`NotepadRepo: Folder ${key} deleted.`);
      return true;
    }
  }

  async renameNotepad(key: string, newName: string): Promise<boolean> {
    const notepadMetadata = await this.fileAPi.renameFileAsync(key, newName);
    if (!notepadMetadata) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      return false;
    }
    else {
      const notepad = this.findNotepad(key);
      notepad.metadata = new ItemMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
      return true;
    }
  }

  async renameFolder(key: string, newName: string): Promise<boolean> {
    const notepadMetadata = await this.fileAPi.renameFolderAsync(key, newName);
    if (!notepadMetadata) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      return false;
    }
    else {
      const notepad = this.findNotepad(key);
       notepad.metadata.name = newName;
       //TODO sha and key will now be wrong for the folder, but i dont use them. Get rid of key and sha possibly, but doing so will remove any file or folder having same name
      return true;
    }
  }
}
