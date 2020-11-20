import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';

import { GitHubMetaData } from '../models/gitHubMetaData'

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { LoggerService } from './logger.service';
import { Notepad, NotepadMetadata } from '../models/notepad-models';

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
  public currentNotepad: Notepad = null;

  public state: BehaviorSubject<State[]> = new BehaviorSubject([]);

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService,
    private loggerService: LoggerService) {
    this.currentNotepad = new Notepad();
    this.currentNotepad.metadata = new NotepadMetadata();
  }

  addState(state: State) {
    const currentState = this.state.getValue();
    currentState.push(state);
    this.state.next(currentState);
  }

  getNotepadListing = (): Observable<NotepadMetadata[]> => {
    return this.http.get<NotepadMetadata[]>(this.baseMessagesUrl, this.restHelper.options());
  }

  getAllNotepads(): void {
    this.loggerService.log('getting all notepads', 'info');
    this.messageService.add(`Getting all notepads.`);
    this.getNotepadListing().subscribe(
      {
        next: (notepads: NotepadMetadata[]) => {
          this.loggerService.log('got all notepads', 'info');
          this.loggerService.log(notepads, 'info');

          // TODO, dont always clear, we could already have the content, and save future rest calls
          this.notepads = [];
          notepads.forEach((notepadMetadata: NotepadMetadata) => {
            const notepad = new Notepad();
            const npMetadata = new NotepadMetadata()
            npMetadata.name = notepadMetadata.name;
            npMetadata.git_url = notepadMetadata.git_url;
            npMetadata.path = notepadMetadata.path;
            npMetadata.sha = notepadMetadata.sha;
            npMetadata.size = notepadMetadata.size;
            npMetadata.type = notepadMetadata.type;
            notepad.metadata = npMetadata;
            notepad.content = '';
            this.notepads.push(notepad)
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

  getNotepad(notepad: Notepad) {
    this.loggerService.log('getting notepad', 'info');
    this.messageService.add(`Get notepad.`);

    if ([undefined, null].includes(notepad)){
      console.log(notepad.metadata);
    }
    this.http.get<any>(this.restHelper.removeUrlParams(notepad.metadata.git_url), this.restHelper.options()).subscribe(
      {
        next: (value: any) => {
          this.loggerService.log('got notepad', 'info');
          notepad.content = atob(value.content);

          this.currentNotepad = notepad;

          this.messageService.add(` • Got notepad.`);

          this.addState(State.GotNotepad);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepad');
          this.addState(State.Error);
        }
      });
  }

  getNotepadObservable(notepad: Notepad) {
    this.loggerService.log('getting notepad', 'info');
    this.messageService.add(`Get notepad.`);
    return this.http.get<any>(this.restHelper.removeUrlParams(notepad.metadata.git_url), this.restHelper.options())
  }

  // checkForUpdatedNotepad(name: string): Observable<RecieveChat> {
  //   return this.http.get<any>(`${this.baseMessagesUrl}/${name}.json`, this.restHelper.options())
  //     .pipe(
  //       retry(3)
  //     ).pipe(
  //       map((gitHubResult: any) => {
  //         return this.parseGitHubGetResult(gitHubResult);
  //       })
  //     )
  // }

  postNotepad(text: string, name: string, sha: string): void {
    this.messageService.add(`Posting notepad sha: ${sha}.`);

    const postUrl = `${this.baseMessagesUrl}/${name}`;

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      "content": btoa(text),
      'sha': sha
    });

    this.loggerService.log(`Sha before post: ${sha}.`, 'info');

    this.http.put(postUrl, rawCommitBody, this.restHelper.options())
      .subscribe({
        next: (contentAndCommit) => {
          const notepadMetadata = contentAndCommit['content'] as NotepadMetadata;

          const notepad = new Notepad();
          notepad.content = text;

          notepad.metadata = new NotepadMetadata();
          notepad.metadata.name = notepadMetadata.name;
          notepad.metadata.path = notepadMetadata.path;
          notepad.metadata.sha = notepadMetadata.sha;
          notepad.metadata.size = notepadMetadata.size;
          notepad.metadata.type = notepadMetadata.type;
          notepad.metadata.git_url = notepadMetadata.git_url;


          this.loggerService.log(`Sha after post: ${notepad.metadata.sha}`, 'info');
          // TODO: dont remove it, just update the exisitng one
          this.notepads = this.notepads.filter(np => notepad.metadata.sha !== sha);

          this.notepads.push(notepad);
          this.currentNotepad = notepad;

          this.messageService.add(` • Posted notepad sha: ${notepad.metadata.sha}.`);

          this.addState(State.UpdatedNotepad);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `posting notepad sha: ${sha}`);
          this.addState(State.Error);
        }
      });
  }

  postNotepadObservable(text: string, name: string, sha: string): Observable<any> {
    this.messageService.add(`Posting notepad sha: ${sha}.`);

    const postUrl = `${this.baseMessagesUrl}/${name}`;

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      "content": btoa(text),
      'sha': sha
    });

    this.loggerService.log(`Sha before post: ${sha}.`, 'info');

    return this.http.put(postUrl, rawCommitBody, this.restHelper.options());
  }

  deleteNotepad(sha: string, name: string): void {
    const deletetUrl = `${this.baseMessagesUrl}/${name}`;

    const notepadExists = this.notepads.find(np => np.metadata.name === name && np.metadata.sha === sha) !== null;
    if (!notepadExists) {
      this.messageService.add(` • notepad ${name} could not be deleted.`, 'error');
      this.addState(State.Error);
    }

    const commit = {
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${sha}`
    }

    const rawCommitBody = JSON.stringify(commit);

    this.notepads = this.notepads.filter(n => n.metadata.name !== name);

    this.http.request('delete', deletetUrl, { body: rawCommitBody, headers: this.restHelper.options().headers }).subscribe({
      next: (notepad: any) => {
        this.messageService.add(` • notepad ${name} deleted.`);
        this.addState(State.DeletedNotepad);
      },
      error: (err: any) => {
        this.restHelper.errorMessageHandler(err, `deleting notepad ${name}`);
        this.addState(State.Error);
      }
    });
  }

  renameNotepad(sha: string, name: string, newName: string) {
    const notepad = this.notepads.find(np => np.metadata.sha === this.currentNotepad.metadata.sha
      && np.metadata.name === this.currentNotepad.metadata.name);
    this.getNotepadObservable(notepad).pipe(() => {
      return this.postNotepadObservable(this.currentNotepad.content, newName, '')
    })
      .subscribe({
        next: (notepad: any) => {
          this.messageService.add(` • notepad ${name} renamed to ${newName}.`);
          this.deleteNotepadObservable(sha, name).subscribe(() => {
            this.getAllNotepads();
          })
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `renaming notepad ${name}`);
          this.addState(State.Error);
        }
      });
  }

  deleteNotepadObservable(sha: string, name: string): Observable<any> {
    const deletetUrl = `${this.baseMessagesUrl}/${name}`;

    const notepadExists = this.notepads.find(np => np.metadata.name === name && np.metadata.sha === sha) !== null;
    if (!notepadExists) {
      this.messageService.add(` • notepad ${name} could not be deleted.`, 'error');
      this.addState(State.Error);
    }

    const commit = {
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${sha}`
    }

    const rawCommitBody = JSON.stringify(commit);

    this.notepads = this.notepads.filter(n => n.metadata.name !== name);

    return this.http.request('delete', deletetUrl, { body: rawCommitBody, headers: this.restHelper.options().headers });
  }

  // helpers
  idExtractor = (fileName: string): number =>
    parseInt(fileName.match(/[0-9]{1,100000}/)[0]);

  fileNameFilter = (chatMessagesMetaData: GitHubMetaData[]): GitHubMetaData[] =>
    chatMessagesMetaData.filter(metdata => metdata['name'].match(/id_[0-9]{1,100000}\.json/));

  sortByName = (chatMessagesMetaData: GitHubMetaData[]): GitHubMetaData[] =>
    this.fileNameFilter(chatMessagesMetaData).sort((a, b) => this.idExtractor(a['name']) - this.idExtractor(b['name']));

  getChatsFromEnd = (chatMessagesMetaData: GitHubMetaData[], fromEnd: number): GitHubMetaData[] =>
    chatMessagesMetaData.slice(Math.max(chatMessagesMetaData.length - fromEnd, 0));
}
