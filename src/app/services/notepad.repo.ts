import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';

import { RecieveChat } from '../models/recieve-chat.model';
import { GitHubMetaData } from '../models/gitHubMetaData'

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { LoggerService } from './logger.service';

export enum State {
  GotNotepad = "GotNotepad",
  GotNotepadListing = "GotNotepadListing",
  DeletedNotepad = "DeletedNotepad",
  CreatedNotepad = "CreatedNotepad",
  UpdatedNotepad = "UpdatedNotepad",
  RenamedNotepad = 'RenamedNotepad',
  Error = "Error",
}
// getAllNotepads
// download_url: "https://raw.githubusercontent.com/bealesd/notepadStore/main/renamed3.json?token=AIBPC5QAW4XHYV7ICGF4AV27W7WMC"
// git_url: "https://api.github.com/repos/bealesd/notepadStore/git/blobs/dbe94988e3b8490bef3471ddf78410bd1d6b4047"
// html_url: "https://github.com/bealesd/notepadStore/blob/main/renamed3.json"
// name: "renamed3.json"
// path: "renamed3.json"
// sha: "dbe94988e3b8490bef3471ddf78410bd1d6b4047"
// size: 24
// type: "file"
// url: "https://api.github.com/repos/bealesd/notepadStore/contents/renamed3.json?ref=main"

@Injectable({
  providedIn: 'root'
})
export class NotepadRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/notepadStore/contents';
  public notepads = [];
  public currentNotepad = { name: '', content: '', sha: '' };
  public state: BehaviorSubject<State[]> = new BehaviorSubject([]);

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService,
    private loggerService: LoggerService) {
  }

  addState(state: State) {
    const currentState = this.state.getValue();
    currentState.push(state);
    this.state.next(currentState);
  }

  getNotepadListing = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.restHelper.options());
  }

  getAllNotepads(): void {
    this.loggerService.log('getting all notepads', 'info');
    this.messageService.add(`Getting all notepads.`);
    this.getNotepadListing().subscribe(
      {
        next: (notepads: any[]) => {
          this.loggerService.log('got all notepads', 'info');
          this.loggerService.log(notepads, 'info');
          notepads.forEach(np => np.name = np.name.split('.json')[0]);
          this.notepads = notepads;
          this.messageService.add(` • Got all notepads.`);

          this.addState(State.GotNotepadListing);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepads');
          this.addState(State.Error);
        }
      });
  }

  getNotepad(notepadMetdata) {
    this.loggerService.log('getting notepad', 'info');
    this.messageService.add(`Get notepad.`);
    //use the download_url
    this.http.get<any>(this.restHelper.removeUrlParams(notepadMetdata['git_url']), this.restHelper.options()).subscribe(
      {
        next: (notepad: any) => {
          this.loggerService.log('got notepad', 'info');
          notepad.name = notepadMetdata.name;
          //why this, we know the sha, and the name
          this.currentNotepad = this.parseGitHubGetResult(notepad);
          this.messageService.add(` • Got notepad.`);

          this.addState(State.GotNotepad);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepad');
          this.addState(State.Error);
        }
      });
  }

  getNotepadObservable(notepadMetdata) {
    this.loggerService.log('getting notepad', 'info');
    this.messageService.add(`Get notepad.`);
    return this.http.get<any>(this.restHelper.removeUrlParams(notepadMetdata['git_url']), this.restHelper.options())
  }

  parseGitHubGetResult(gitHubResult: any): any {
    const chatObject = JSON.parse(atob(atob(gitHubResult.content)));
    return {
      sha: gitHubResult.sha,
      content: chatObject.content,
      name: gitHubResult.name
    }
  }

  checkForUpdatedNotepad(name: string): Observable<RecieveChat> {
    return this.http.get<any>(`${this.baseMessagesUrl}/${name}.json`, this.restHelper.options())
      .pipe(
        retry(3)
      ).pipe(
        map((gitHubResult: any) => {
          return this.parseGitHubGetResult(gitHubResult);
        })
      )
  }

  postNotepad(text: string, name: string, sha: string): void {
    this.messageService.add(`Posting notepad sha: ${sha}.`);

    const postUrl = `${this.baseMessagesUrl}/${name}.json`;

    const newMessage = { content: text };
    const rawCommitBody = JSON.stringify({
      "message": `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      "content": btoa(btoa(JSON.stringify(newMessage))),
      'sha': sha
    });

    this.loggerService.log(`Sha before post: ${sha}.`, 'info');

    this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.restHelper.options())
      .subscribe({
        next: (notepad) => {
          const newNotepad = {
            sha: notepad['content'].sha,
            git_url: notepad['content']['git_url'],
            size: notepad['content']['size'],
            content: text,
            name: name,
          }
          this.loggerService.log(`Sha after post: ${notepad['content'].sha}`, 'info');

          this.notepads = this.notepads.filter(np => np.sha !== sha);

          this.notepads.push(newNotepad);
          this.currentNotepad = newNotepad;

          this.messageService.add(` • Posted notepad sha: ${newNotepad['sha']}.`);

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

    const postUrl = `${this.baseMessagesUrl}/${name}.json`;

    const newMessage = { content: text };
    const rawCommitBody = JSON.stringify({
      "message": `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      "content": btoa(btoa(JSON.stringify(newMessage))),
      'sha': sha
    });

    this.loggerService.log(`Sha before post: ${sha}.`, 'info');

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.restHelper.options());
  }

  deleteNotepad(sha: string, name: string): void {
    const deletetUrl = `${this.baseMessagesUrl}/${name}.json`;

    const notepadExists = this.notepads.find(np => np.name === name && np.sha === sha) !== null;
    if (!notepadExists) {
      this.messageService.add(` • notepad ${name} could not be deleted.`, 'error');
      this.addState(State.Error);
    }

    const commit = {
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${sha}`
    }

    const rawCommitBody = JSON.stringify(commit);

    this.notepads = this.notepads.filter(n => n.name !== name);

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
    const notepad = this.notepads.find(np => np.sha === this.currentNotepad.sha && np.name === this.currentNotepad.name);
    this.getNotepadObservable(notepad).pipe(() => {
      return this.postNotepadObservable(this.currentNotepad.content, newName, '')
    })
      .subscribe({
        next: (notepad: any) => {
          this.messageService.add(` • notepad ${name} renamed to ${newName}.`);
          this.deleteNotepadObservable(sha, name).subscribe(()=>{
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
    const deletetUrl = `${this.baseMessagesUrl}/${name}.json`;

    const notepadExists = this.notepads.find(np => np.name === name && np.sha === sha) !== null;
    if (!notepadExists) {
      this.messageService.add(` • notepad ${name} could not be deleted.`, 'error');
      this.addState(State.Error);
    }

    const commit = {
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${sha}`
    }

    const rawCommitBody = JSON.stringify(commit);

    this.notepads = this.notepads.filter(n => n.name !== name);

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
