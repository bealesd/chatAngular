import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';

import { RecieveChat } from '../models/recieve-chat.model';
import { GitHubMetaData } from '../models/gitHubMetaData'

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class NotepadRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/notepadStore/contents';
  public notepads = [];
  public currentNotepad = new BehaviorSubject({ name: '', content: '', sha: '' });

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService,
    private loggerService: LoggerService) {
  }

  resetCurrentNotepad(){
    this.currentNotepad.next({ name: '', content: '', sha: '' });
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
          this.resetCurrentNotepad();
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepads');
        }
      });
  }

  getNotepad(notepadMetdata) {
    this.loggerService.log('getting notepad', 'info');
    this.messageService.add(`Get notepad.`);
    this.http.get<any>(this.restHelper.removeUrlParams(notepadMetdata['git_url']), this.restHelper.options()).subscribe(
      {
        next: (notepad: any) => {
          this.loggerService.log('got notepad', 'info');
          notepad.name = notepadMetdata.name;
          this.currentNotepad.next(this.parseGitHubGetResult(notepad));
          this.messageService.add(` • Got notepad.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepad');
        }
      });
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
          this.currentNotepad.next(newNotepad);

          this.messageService.add(` • Posted notepad sha: ${newNotepad['sha']}.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `posting notepad sha: ${sha}`);
        }
      });
  }

  deleteNotepad(name: any): void {
    const deletetUrl = `${this.baseMessagesUrl}/${name}.json`;
    const sha = this.notepads.find(np => np.name === name).sha;

    const commit = {
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${sha}`
    }

    const rawCommitBody = JSON.stringify(commit);

    this.notepads = this.notepads.filter(n => n.name !== name);

    this.http.request('delete', deletetUrl, { body: rawCommitBody, headers: this.restHelper.options().headers }).subscribe({
      next: (notepad: any) => {
        if (notepad !== undefined && notepad !== null) {
          this.messageService.add(` • notepad ${name} deleted.`);
        }
        else {
          this.messageService.add(` • notepad ${name} could not be deleted.`);
        }
        this.resetCurrentNotepad();
      },
      error: (err: any) => {
        this.restHelper.errorMessageHandler(err, `deleting notepad ${name}`);
      }
    });
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