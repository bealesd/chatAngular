import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MessageService } from './message.service';
import { Notepad, NotepadMetadata } from '../models/notepad-models';
import { FileApiFactory, FileApi } from './file-api';

export enum State {
  GotNotepad = "GotNotepad",
  GotNotepadListing = "GotNotepadListing",
  DeletedNotepad = "DeletedNotepad",
  CreatedNotepad = "CreatedNotepad",
  UpdatedNotepad = "UpdatedNotepad",
  RenamedNotepad = 'RenamedNotepad',
  Error = "Error",
}

@Injectable({
  providedIn: 'root'
})
export class NotepadRepo {
  public notepads: Notepad[] = [];
  public currentNotepadKey: string = '';

  public state: BehaviorSubject<State[]> = new BehaviorSubject([]);
  fileAPi: FileApi;
  currentNotepadName: string;

  constructor(
    private messageService: MessageService,
    private fileApiFactory: FileApiFactory) {

    this.fileAPi = this.fileApiFactory.create();
    this.fileAPi.dir = '/notepadStore';
  }

  addState(state: State) {
    const currentState = this.state.getValue();
    currentState.push(state);
    this.state.next(currentState);
  }

  findNotepad(name) {
    const notepad = this.notepads.find(np => np.metadata.name === name);
    if (!notepad) {
      this.addState(State.Error);
      return null;
    }
    return notepad;
  }

  async getAllNotepads(): Promise<void> {
    this.messageService.add(`NotepadRepo: Getting all notepads.`);
    const notepads = await this.fileAPi.listFilesAndFoldersAsync();
    if (!notepads) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      this.addState(State.Error);
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
      this.addState(State.GotNotepadListing);
    }
  }

  async getNotepad(name: string): Promise<void> {
    const content = await this.fileAPi.getFileAsync(name)
    if (content === null) {
      this.messageService.add('NotepadRepo: Getting notepad.', 'error');
      this.addState(State.Error);
    }
    else {
      this.notepads.find(v => v.metadata.name === name).content = content;
      this.currentNotepadKey = this.notepads.find(v => v.metadata.name === name).metadata.key;
      this.currentNotepadName = this.notepads.find(v => v.metadata.name === name).metadata.name;

      this.messageService.add(`NotepadRepo: Got notepad.`);
      this.addState(State.GotNotepad);
    }
  }

  async updateNotepad(name: string): Promise<void> {
    const notepad = this.findNotepad(name);
    const result = await this.fileAPi.editFileAsync(name, notepad.content)
    if (!result) {
      this.messageService.add(`NotepadRepo: Posting notepad sha: ${notepad.metadata.sha}.`, 'error');
      this.addState(State.Error);
    }
    else {
      notepad.metadata.sha = result.sha;
      this.currentNotepadKey = notepad.metadata.key;

      this.messageService.add(`NotepadRepo: Posted notepad sha: ${notepad.metadata.sha}.`);
      this.addState(State.UpdatedNotepad);
    }
  }

  async postNotepad(text: string, name: string): Promise<void> {
    const notepadMetadata = await this.fileAPi.newFileAsync(name, text)
    if (!notepadMetadata) {
      this.messageService.add(`NotepadRepo: Posting notepad name: ${name}.`, 'error');
      this.addState(State.Error);
    }
    else {
      const notepad = new Notepad();
      notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
      notepad.content = text;
      this.notepads.push(notepad);

      this.messageService.add(`NotepadRepo: Posted notepad name: ${notepad.metadata.name}.`);
      this.addState(State.CreatedNotepad);
    }
  }

  async deleteNotepad(name: string): Promise<void> {
    const result = await this.fileAPi.deleteFileAsync(name);
    if (!result) {
      this.messageService.add(`NotepadRepo: Deleting notepad ${name}.`, 'error');
      this.addState(State.Error);
    }
    else {
      this.notepads = this.notepads.filter(n => n.metadata.name !== name);
      this.messageService.add(`NotepadRepo: Notepad ${name} deleted.`);
      this.addState(State.DeletedNotepad);
    }
  }

  async renameNotepad(oldName: string, newName: string): Promise<void> {
    const notepadMetadata = await this.fileAPi.renameFileAsync(oldName, newName);
    if (!notepadMetadata) {
      this.messageService.add('NotepadRepo: Getting notepads.', 'error');
      this.addState(State.Error);
    }
    else {
      const notepad = this.findNotepad(oldName);
      notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
      this.addState(State.RenamedNotepad);
    }
  }
}
