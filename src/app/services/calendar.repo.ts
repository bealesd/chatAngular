import { Injectable } from '@angular/core';

import { Observable, of, forkJoin, BehaviorSubject, Subscriber, interval } from 'rxjs';
import { catchError, map, tap, retry, mergeMap, defaultIfEmpty } from 'rxjs/operators';

import { MessageService } from './message.service';
import { RecieveChat } from '../models/recieve-chat.model';
import { SendChat } from '../models/send-chat.model';
import { GitHubMetaData } from '../gitHubMetaData'

import { CryptoService } from './crypto.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/calendarStore/contents';
  private baseRawMessagesUrl = 'https://raw.githubusercontent.com/bealesd/calendarStore/master';

  constructor(
    private cryptoService: CryptoService,
    private http: HttpClient,
    private messageService: MessageService) { }

  private log = (message: string): void =>
    this.messageService.add(`${message}`);

  options = (): { headers: HttpHeaders } => {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cryptoService.getToken()}`
      })
    }
  }

  getCalendarListings = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options()).pipe(
      catchError(this.handleError<GitHubMetaData[]>('Could not get calendar messages metdata.', []))
    )
  }

  attemptLogin = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options()).pipe(
      catchError(this.handleError<GitHubMetaData[]>('Could not get calendar messages metdata for login.', undefined))
    )
  }

  getCalendarRecordsForMonth(year: number, month: number): Observable<any> {
    const getUrl = `${this.baseMessagesUrl}/${year}-${month}.json`;
    return this.http.get<[]>(this.removeUrlParams(getUrl), this.options());
  }

  postCalendarRecords(year, month, calendarRecords: any, sha): Observable<any> {
    const postUrl = `${this.baseMessagesUrl}/${year}-${month}.json`;

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by calendar record wesbite at ${new Date().toLocaleString()}`,
      "content": btoa(JSON.stringify(calendarRecords)),
      'sha': sha
    });

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.options());
  }

  // helpers
  // todo - if auth error, go to login page?
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`Failed REST request. ${operation} ${error.message}.`);
      return of(result as T);
    }
  }

  idExtractor = (fileName: string): number =>
    parseInt(fileName.match(/[0-9]{1,100000}/)[0]);

  fileNameFilter(chatMessagesMetaData: GitHubMetaData[]): GitHubMetaData[] {
    return chatMessagesMetaData.filter((metdata: GitHubMetaData) => {
      metdata.name.match(/id_[0-9]{1,100000}\.json/)
    });
    // return chatMessagesMetaData.filter(metdata => metdata['name'].match(/id_[0-9]{1,100000}\.json/));
  }

  sortByName = (chatMessagesMetaData: GitHubMetaData[]): GitHubMetaData[] =>
    this.fileNameFilter(chatMessagesMetaData).sort((a: GitHubMetaData, b: GitHubMetaData) => this.idExtractor(a.name) - this.idExtractor(b.name));

  getChatsFromEnd = (chatMessagesMetaData: GitHubMetaData[], fromEnd: number): GitHubMetaData[] =>
    chatMessagesMetaData.slice(Math.max(chatMessagesMetaData.length - fromEnd, 0));

  removeUrlParams = (rawUrl: string) =>
    new URL(rawUrl).origin + new URL(rawUrl).pathname;
}
