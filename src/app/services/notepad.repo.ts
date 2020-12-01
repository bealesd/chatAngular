import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { from } from 'rxjs';

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

  getAllNotepads(): void {
    this.messageService.add(`NotepadRepo: Getting all notepads.`);
    from(this.fileAPi.listFilesAndFoldersAsync())
      .subscribe((notepads: NotepadMetadata[]) => {
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
      });
  }

  getNotepad(name: string) {
    from(this.fileAPi.getFileAsync(name))
      .subscribe((content: any) => {
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
      });
  }

  updateNotepad(name: string): void {
    const notepad = this.findNotepad(name);
    from(this.fileAPi.editFileAsync(name, notepad.content))
      .subscribe((result: NotepadMetadata) => {
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
      });
  }

  postNotepad(text: string, name: string): void {
    from(this.fileAPi.newFileAsync(name, text))
      .subscribe(
        (notepadMetadata: NotepadMetadata) => {
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
        });
  }

  deleteNotepad(name: string): void {
    from(this.fileAPi.deleteFileAsync(name))
      .subscribe((result: any) => {
        if (!result) {
          this.messageService.add(`NotepadRepo: Deleting notepad ${name}.`, 'error');
          this.addState(State.Error);
        }
        else {
          this.notepads = this.notepads.filter(n => n.metadata.name !== name);
          this.messageService.add(`NotepadRepo: Notepad ${name} deleted.`);
          this.addState(State.DeletedNotepad);
        }
      });
  }

  renameNotepad(oldName: string, newName: string) {
    from(this.fileAPi.renameFileAsync(oldName, newName))
      .subscribe((notepadMetadata: NotepadMetadata) => {
        if (!notepadMetadata) {
          this.messageService.add('NotepadRepo: Getting notepads.', 'error');
          this.addState(State.Error);
        }
        else {
          const notepad = this.findNotepad(oldName);
          notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
          this.addState(State.RenamedNotepad);
        }
      });
  }

}
