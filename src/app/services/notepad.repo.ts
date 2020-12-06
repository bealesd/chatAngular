import { Injectable } from '@angular/core';

import { MessageService } from './message.service';
import { Notepad, NotepadMetadata } from '../models/notepad-models';
import { FileApiFactory, FileApi } from './file-api';

@Injectable({
  providedIn: 'root'
})
export class NotepadRepo {
  public notepads: Notepad[] = [];
  public currentNotepadKey: string = '';

  fileAPi: FileApi;
  currentNotepadName: string;

  constructor(
    private messageService: MessageService,
    private fileApiFactory: FileApiFactory) {

    this.fileAPi = this.fileApiFactory.create();
    this.fileAPi.dir = '/notepadStore';
  }

  findNotepad(name) {
    const notepad = this.notepads.find(np => np.metadata.name === name);
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
      notepads.forEach((notepadMetadata: NotepadMetadata) => {
        const notepad = new Notepad();
        notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
        notepad.content = '';
        this.notepads.push(notepad);
      });
      this.messageService.add(`NotepadRepo: Got all notepads.`);
      return true
    }
  }

  async getNotepad(name: string): Promise<boolean> {
    const content = await this.fileAPi.getFileAsync(name)
    if (content === null) {
      this.messageService.add('NotepadRepo: Getting notepad.', 'error');
      return false;
    }
    else {
      this.notepads.find(v => v.metadata.name === name).content = content;
      this.currentNotepadKey = this.notepads.find(v => v.metadata.name === name).metadata.key;
      this.currentNotepadName = this.notepads.find(v => v.metadata.name === name).metadata.name;

      this.messageService.add(`NotepadRepo: Got notepad.`);
      return true;
    }
  }

  async updateNotepad(name: string): Promise<boolean> {
    const notepad = this.findNotepad(name);
    const result = await this.fileAPi.editFileAsync(name, notepad.content)
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
    const notepadMetadata = await this.fileAPi.newFileAsync(name, text)
    if (!notepadMetadata) {
      this.messageService.add(`NotepadRepo: Posting notepad name: ${name}.`, 'error');;
      return false;
    }
    else {
      const notepad = new Notepad();
      notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
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
      const notepad = new Notepad();
      notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
      // notepad.content = text;
      this.notepads.push(notepad);

      this.messageService.add(`NotepadRepo: Posted notepad name: ${notepad.metadata.name}.`);
      return true;
    }
  }

  async deleteNotepad(name: string): Promise<boolean> {
    const result = await this.fileAPi.deleteFileAsync(name);
    if (!result) {
      this.messageService.add(`NotepadRepo: Deleting notepad ${name}.`, 'error');
      return false;
    }
    else {
      this.notepads = this.notepads.filter(n => n.metadata.name !== name);
      this.messageService.add(`NotepadRepo: Notepad ${name} deleted.`);
      return true;
    }
  }

  async renameNotepad(oldName: string, newName: string): Promise<boolean> {
    const notepadMetadata = await this.fileAPi.renameFileAsync(oldName, newName);
    if (!notepadMetadata) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      return false;
    }
    else {
      const notepad = this.findNotepad(oldName);
      notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
      return true;
    }
  }

  async renameFolder(oldName: string, newName: string): Promise<boolean> {
    const notepadMetadata = await this.fileAPi.renameFolderAsync(oldName, newName);
    if (!notepadMetadata) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      return false;
    }
    else {
      const notepad = this.findNotepad(oldName);
      notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
      return true;
    }
  } 
}
