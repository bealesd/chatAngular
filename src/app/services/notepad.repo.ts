import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { Notepad, NotepadMetadata } from '../models/notepad-models';
import { mergeMap } from 'rxjs/operators';

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

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
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

  getNotepadListing = (): Observable<NotepadMetadata[]> => {
    return this.http.get<NotepadMetadata[]>(this.baseMessagesUrl, this.restHelper.options());
  }

  getAllNotepads(): void {
    this.messageService.add(`Getting all notepads.`);
    this.getNotepadListing().subscribe(
      {
        next: (notepads: NotepadMetadata[]) => {
          this.notepads = [];
          notepads.forEach((notepadMetadata: NotepadMetadata) => {
            const notepad = new Notepad();
            notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type);
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

  getNotepad(key: string) {
    this.getNotepadObservable(key).subscribe(
      {
        next: (value: any) => {
          this.findNotepad(key).content = atob(value.content);
          this.currentNotepadKey = key;

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

  updateNotepad(key: string): void {
    const notepad = this.findNotepad(key);
    this.postNotepadObservable(notepad.content, notepad.metadata.name, notepad.metadata.sha)
      .subscribe({
        next: (contentAndCommit: any) => {
          const notepadMetadata = contentAndCommit.content as NotepadMetadata;
          notepad.metadata.sha = notepadMetadata.sha;

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
    this.postNotepadObservable(text, name, '')
      .subscribe({
        next: (contentAndCommit: any) => {
          const notepadMetadata = contentAndCommit.content as NotepadMetadata;
          const notepad = new Notepad();
          notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type);
          notepad.content = text;
          this.notepads.push(notepad);

          // this.currentNotepadKey = notepad.metadata.key;

          this.messageService.add(` • Posted notepad name: ${notepad.metadata.name}.`);
          this.addState(State.CreatedNotepad);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `posting notepad name: ${name}`);
          this.addState(State.Error);
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
    const notepad = this.findNotepad(key);
    this.getNotepadObservable(key).pipe(() => {
      return this.postNotepadObservable(notepad.content, newName, '');
    }).subscribe({
      next: (np: any) => {
        this.messageService.add(` • notepad ${notepad.metadata.name} renamed to ${newName}.`);
        this.deleteNotepadObservable(key).subscribe(() => {
          this.getAllNotepads();
        })
        this.addState(State.RenamedNotepad);
      },
      error: (err: any) => {
        this.restHelper.errorMessageHandler(err, `renaming notepad ${name}`);
        this.addState(State.Error);
      }
    });
  }

  renameNotepad2(key: string, newName: string) {
    const notepad = this.findNotepad(key);

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
              notepad.metadata = new NotepadMetadata(notepadMetadata.name, notepadMetadata.path, notepadMetadata.sha, notepadMetadata.size, notepadMetadata.git_url, notepadMetadata.type);
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

    // this.getNotepadObservable(key).pipe(() => {
    //   return this.postNotepadObservable(notepad.content, newName, '');
    // }).subscribe({
    //     next: (np: any) => {
    //       this.messageService.add(` • notepad ${notepad.metadata.name} renamed to ${newName}.`);
    //       this.deleteNotepadObservable(key).subscribe(() => {
    //         this.getAllNotepads();
    //       })
    //       this.addState(State.RenamedNotepad);
    //     },
    //     error: (err: any) => {
    //       this.restHelper.errorMessageHandler(err, `renaming notepad ${name}`);
    //       this.addState(State.Error);
    //     }
    //   });
  }



}
