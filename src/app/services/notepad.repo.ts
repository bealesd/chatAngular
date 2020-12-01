import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { from } from 'rxjs';

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { Notepad, NotepadMetadata } from '../models/notepad-models';
import { mergeMap } from 'rxjs/operators';
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
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/notepadStore/contents';

  public notepads: Notepad[] = [];
  public currentNotepadKey: string = '';

  public state: BehaviorSubject<State[]> = new BehaviorSubject([]);
  fileAPi: FileApi;
  currentNotepadName: string;

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
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

  findNotepad(key) {
    const notepad = this.notepads.find(np => np.metadata.key === key);
    if (!notepad) {
      this.addState(State.Error);
      return null;
    }
    return notepad;
  }

  findNotepadByName(name) {
    const notepad = this.notepads.find(np => np.metadata.name === name);
    if ([undefined, null].includes(notepad)) {
      this.addState(State.Error);
      return null;
    }
    return notepad;
  }

  getAllNotepads(): void {
    this.messageService.add(`Getting all notepads.`);
    from(this.fileAPi.listFilesAndFoldersAsync())
      .subscribe((notepads: NotepadMetadata[]) => {
        if (!notepads) {
          this.restHelper.errorMessageHandler('', 'getting notepads');
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
          this.messageService.add(` • Got all notepads.`);
          this.addState(State.GotNotepadListing);
        }
      });
  }

  getNotepad(name: string) {
    from(this.fileAPi.getFileAsync(name))
      .subscribe((content: any) => {
        if (content === null) {
          this.restHelper.errorMessageHandler('', 'getting notepad');
          this.addState(State.Error);
        }
        else {
          this.notepads.find(v => v.metadata.name === name).content = content;
          this.currentNotepadKey = this.notepads.find(v => v.metadata.name === name).metadata.key;
          this.currentNotepadName = this.notepads.find(v => v.metadata.name === name).metadata.name;

          this.messageService.add(` • Got notepad.`);
          this.addState(State.GotNotepad);
        }
      });
  }

  updateNotepad(name: string): void {
    const notepad = this.findNotepadByName(name);
    from(this.fileAPi.editFileAsync(name, notepad.content))
      .subscribe((result: NotepadMetadata) => {
        if (!result) {
          this.restHelper.errorMessageHandler('', `posting notepad sha: ${notepad.metadata.sha}`);
          this.addState(State.Error);
        }
        else {
          notepad.metadata.sha = result.sha;
          this.currentNotepadKey = notepad.metadata.key;

          this.messageService.add(` • Posted notepad sha: ${notepad.metadata.sha}.`);
          this.addState(State.UpdatedNotepad);
        }
      });
  }

  postNotepad(text: string, name: string): void {
    from(this.fileAPi.newFileAsync(name, text))
      .subscribe(
        (notepadMetadata: NotepadMetadata) => {
          if (!notepadMetadata) {
            this.restHelper.errorMessageHandler(null, `posting notepad name: ${name}`);
            this.addState(State.Error);
          }
          else {
            const notepad = new Notepad();
            notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
            notepad.content = text;
            this.notepads.push(notepad);

            this.messageService.add(` • Posted notepad name: ${notepad.metadata.name}.`);
            this.addState(State.CreatedNotepad);
          }
        });
  }

  deleteNotepad(name: string): void {
    from(this.fileAPi.deleteFileAsync(name))
      .subscribe((result: any) => {
        if (!result) {
          this.restHelper.errorMessageHandler('', `deleting notepad ${name}`);
          this.addState(State.Error);
        }
        else {
          this.notepads = this.notepads.filter(n => n.metadata.name !== name);
          this.messageService.add(` • notepad ${name} deleted.`);
          this.addState(State.DeletedNotepad);
        }
      });
  }

  renameNotepad(oldName: string, newName: string) {
    from(this.fileAPi.renameFileAsync(oldName, newName))
      .subscribe((notepadMetadata: NotepadMetadata) => {
        if (!notepadMetadata) {
          this.restHelper.errorMessageHandler('', 'getting notepads');
          this.addState(State.Error);
        }
        else {
          const notepad = this.findNotepadByName(oldName);
          notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
          this.addState(State.RenamedNotepad);
        }
      });
  }

}
