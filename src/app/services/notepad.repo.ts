import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';

import { RecieveChat } from '../models/recieve-chat.model';
import { GitHubMetaData } from '../models/gitHubMetaData'

import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class NotepadRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/notepadStore/contents';
  public notepads = [];
  public currentNotepad = {};

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
  }

  getNotepadListing = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.restHelper.options());
  }

  getAllNotepads(): void {
    this.messageService.add(`Getting all notepads.`);
    this.getNotepadListing().subscribe(
      {
        next: (notepads: any[]) => {
          console.debug(notepads);
          notepads.forEach(np => np.name = np.name.split('.json')[0]);
          this.notepads = notepads;
          this.messageService.add(` • Got all notepads.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting notepads');
        }
      });
  }

  getNotepad(notepadMetdata, cb) {
    this.messageService.add(`Get notepad.`);
    this.currentNotepad = {};
    this.http.get<any>(this.restHelper.removeUrlParams(notepadMetdata['git_url']), this.restHelper.options()).subscribe(
      {
        next: (notepad: any) => {
          console.debug(notepad);
          notepad.name = notepadMetdata.name;
          this.currentNotepad = this.parseGitHubGetResult(notepad);
          this.messageService.add(` • Got notepad.`);
          cb(notepadMetdata.name);
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

  postNotepad(text: string, name: string): void {
    const postUrl = this.baseMessagesUrl + `/${name}.json`;

    const newMessage = { content: text };
    let commit = {
      "message": `Api commit by notepad repo at ${new Date().toLocaleString()}`,
      "content": btoa(btoa(JSON.stringify(newMessage))),
    }

    const oldNotepad = this.notepads.find(np => np.name === name);
    if (oldNotepad !== undefined)
      commit['sha'] = oldNotepad['sha'];

    const rawCommitBody = JSON.stringify(commit);

    this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.restHelper.options())
      .subscribe({
        next: (notepad) => {
          const newNotepad = {
            sha: notepad['content'].sha,
            git_url: notepad['content']['git_url'],
            content: text,
            name: name
          }
          if (oldNotepad !== undefined)
            this.notepads = this.notepads.filter(np => np.name !== name);

          this.notepads.push(newNotepad);
          this.currentNotepad = newNotepad;

          this.messageService.add(` • Posted notepad sha: ${newNotepad['sha']}.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'posting notepad');
        }
      });
  }

  deleteNotepad(name: any): void {
    const deletetUrl = this.baseMessagesUrl + `/${name}.json`;
    const sha = this.notepads.filter((n) => n.name !== name);

    const commitBody = {
      "message": `Api delete commit by notepad repo at ${new Date().toLocaleString()}`,
      "sha": `${sha}`
    }
    const rawCommitBody = JSON.stringify(commitBody);

    this.http.request('delete', deletetUrl, { body: rawCommitBody, headers: this.restHelper.options().headers }).subscribe({
      next: (notepad: any) => {
        if (notepad !== undefined && notepad !== null) {
          this.messageService.add(` • notepad ${name} deleted.`);
          this.notepads = this.notepads.filter((n) => n.name !== name);
        }
        else {
          this.messageService.add(` • notepad ${name} could not be deleted.`);
        }

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