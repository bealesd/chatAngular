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
    // fileAPi.changeDirectoryAsync('/calendarStore')
    //   .then((result) => {
    //     if (result)
    //       messageService.add('changeDirectory done');
    //     else
    //       messageService.add('changeDirectory failed', 'error');
    //     messageService.add(fileAPi.dir);
    //   })
    //   .then(() => {
    //     return fileAPi.listFilesAndFoldersAsync()
    //   })
    //   .then((result) => {
    //     return fileAPi.getFileAsync(result[0].name)
    //   })
    //   .then((result) => {
    //     if (result === null) {
    //       messageService.add('get failed', 'error');
    //     }
    //     else {
    //       console.log(result);
    //     }
    //   })
    //   .then(() => {
    //     return fileAPi.newFileAsync('deleteMe.txt', 'hello world');
    //   })
    //   .then((result)=>{
    //     return fileAPi.editFileAsync(result.name, 'updated')
    //   })
    //   .then((result)=>{
    //     return fileAPi.deleteFileAsync(result.name);
    //   })
    //   .then(()=>{
    //     return fileAPi.newFolderAsync('david');
    //   })
    //   .then((result)=>{
    //     return fileAPi.deleteFolderAsync('david');
    //   })
    //   .then(() => {
    //     return fileAPi.changeDirectoryAsync('/calendarStore/test');
    //   })
    //   .then((result) => {
    //     if (result)
    //       messageService.add('changeDirectory /test done');
    //     else
    //       messageService.add('changeDirectory /test failed', 'error');
    //   });
  }

  addState(state: State) {
    const currentState = this.state.getValue();
    currentState.push(state);
    this.state.next(currentState);
  }

  findNotepad(key) {
    const notepad = this.notepads.find(np => np.metadata.key === key);
    if ([undefined, null].includes(notepad)) {
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

  getNotepadListing = (): Observable<NotepadMetadata[]> => {
    return from(this.fileAPi.listFilesAndFoldersAsync());
  }

  getAllNotepads(): void {
    this.messageService.add(`Getting all notepads.`);
    this.getNotepadListing().subscribe(
      {
        next: (notepads: NotepadMetadata[]) => {
          this.notepads = [];
          notepads.forEach((notepadMetadata: NotepadMetadata) => {
            const notepad = new Notepad();
            notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
            notepad.content = '';
            this.notepads.push(notepad);
          });

          this.messageService.add(` • Got all notepads.`);
          this.addState(State.GotNotepadListing);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepads');
          this.addState(State.Error);
        }
      });
  }

  getNotepad(name: string) {
    from(this.fileAPi.getFileAsync(name))
      .subscribe(
        {
          next: (content: any) => {
            this.notepads.find(v => v.metadata.name === name).content = content;
            this.currentNotepadKey = this.notepads.find(v => v.metadata.name === name).metadata.key;
            this.currentNotepadName = this.notepads.find(v => v.metadata.name === name).metadata.name;

            this.messageService.add(` • Got notepad.`);
            this.addState(State.GotNotepad);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, 'getting notepad');
            this.addState(State.Error);
          }
        });
  }

  getNotepadObservable(key: string) {
    this.messageService.add(`Get notepad.`);
    return this.http.get<any>(this.restHelper.removeUrlParams(this.findNotepad(key).metadata.git_url), this.restHelper.options())
  }

  updateNotepad(name: string): void {
    const notepad = this.findNotepadByName(name);
    from(this.fileAPi.editFileAsync(name, notepad.content))
      .subscribe({
        next: (result: NotepadMetadata) => {
          notepad.metadata.sha = result.sha;
          this.currentNotepadKey = notepad.metadata.key;

          this.messageService.add(` • Posted notepad sha: ${notepad.metadata.sha}.`);
          this.addState(State.UpdatedNotepad);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `posting notepad sha: ${notepad.metadata.sha}`);
          this.addState(State.Error);
        }
      });
  }

  postNotepad(text: string, name: string): void {
    from(this.fileAPi.newFileAsync(name, text))
      .subscribe({
        next: (notepadMetadata: NotepadMetadata) => {
          if(notepadMetadata === null){
            this.restHelper.errorMessageHandler(null, `posting notepad name: ${name}`);
            this.addState(State.Error);
            return
          }

          const notepad = new Notepad();
          notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
          notepad.content = text;
          this.notepads.push(notepad);

          this.messageService.add(` • Posted notepad name: ${notepad.metadata.name}.`);
          this.addState(State.CreatedNotepad);
        }
      });
  }

  postNotepadObservable(text: string, name: string, sha: string): Observable<any> {
    this.messageService.add(`Posting notepad name: ${name}.`);

    const postUrl = `${this.baseMessagesUrl}/${name}`;
    const rawCommitBody = JSON.stringify({
      "message": `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      "content": btoa(text),
      'sha': sha
    });
    return this.http.put(postUrl, rawCommitBody, this.restHelper.options());
  }

  deleteNotepad(key: string): void {
    this.deleteNotepadObservable(key)
      .subscribe({
        next: (result: any) => {
          this.notepads = this.notepads.filter(n => n.metadata.key !== key);
          this.messageService.add(` • notepad ${key} deleted.`);
          this.addState(State.DeletedNotepad);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `deleting notepad ${key}`);
          this.addState(State.Error);
        }
      });
  }

  deleteNotepadObservable(key: string): Observable<any> {
    const notepad = this.findNotepad(key);
    const deletetUrl = `${this.baseMessagesUrl}/${notepad.metadata.name}`;
    const commit = JSON.stringify({
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${notepad.metadata.sha}`
    });
    return this.http.request('delete', deletetUrl, { body: commit, headers: this.restHelper.options().headers });
  }

  renameNotepad(key: string, newName: string) {
    this.getNotepadObservable(key)
      .pipe(mergeMap((value) => {
        return this.postNotepadObservable(atob(value.content), newName, '');
      }))
      .pipe(mergeMap((value) => {
        return this.deleteNotepadObservable(key);
      }))
      .pipe(mergeMap((value) => {
        return this.getNotepadListing();
      })).subscribe(
        {
          next: (notepads: NotepadMetadata[]) => {
            this.notepads = [];
            notepads.forEach((notepadMetadata: NotepadMetadata) => {
              const notepad = new Notepad();
              notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type, notepadMetadata.url);
              notepad.content = '';
              this.notepads.push(notepad);
            });

            this.messageService.add(` • Got all notepads.`);
            this.addState(State.RenamedNotepad);
          },
          error: (err: any) => {
            this.restHelper.errorMessageHandler(err, 'getting notepads');
            this.addState(State.Error);
          }
        });
  }

}
