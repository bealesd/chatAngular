import { Injectable } from '@angular/core';

import { Observable, of, forkJoin, } from 'rxjs';
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

  getMessageListings = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options()).pipe(
      catchError(this.handleError<GitHubMetaData[]>('Could not get chat messages metdata.', []))
    )
  }

  attemptLogin = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options()).pipe(
      catchError(this.handleError<GitHubMetaData[]>('Could not get chat messages metdata for login.', undefined))
    )
  }

  getLastTen(): Observable<RecieveChat[]> {
    const idShaLookup = {};
    return this.getMessageListings()
      .pipe(
        map((messagesMetaData: GitHubMetaData[]) => {
          messagesMetaData = this.getChatsFromEnd(this.sortByName(messagesMetaData), 10);
          const chatUrls = [];
          for (let i = 0; i < Object.keys(messagesMetaData).length; i++) {
            const messageMetaData = messagesMetaData[i];
            idShaLookup[this.idExtractor(messageMetaData.name)] = messageMetaData.sha;
            chatUrls.push(this.http.get<RecieveChat>(this.removeUrlParams(messageMetaData.download_url)));
          }
          return chatUrls;
        }),
        mergeMap((chatUrls) => {
          return forkJoin(chatUrls);
        }),
        catchError(this.handleError<RecieveChat[]>('Could not get last 10 chat messgaes.', []))
      ).pipe(
        map((results: RecieveChat[]) => {
          results.map((chat) => { chat.Sha = idShaLookup[chat.Id]; });
          return results;
        })
      )
  }

  getNewChatMessages(lastId: number): Observable<RecieveChat[]> {
    if (lastId === null)
      return this.getLastTen();

    return this.getMessageListings()
      .pipe(
        map((messagesMetaData: GitHubMetaData[]) => {
          messagesMetaData = this.sortByName(messagesMetaData);
          const calenderUrls = [];
          for (let i = 0; i < Object.keys(messagesMetaData).length; i++) {
            const messageMetaData = messagesMetaData[i];
            if (this.idExtractor(messageMetaData.name) > lastId)
              calenderUrls.push(this.http.get<RecieveChat>(this.removeUrlParams(messageMetaData.download_url)));
          }
          return calenderUrls;
        }),
        mergeMap((chatUrls) => {
          return forkJoin(chatUrls).pipe(
            defaultIfEmpty(null),
          );
        }),
        catchError(this.handleError<RecieveChat[]>('Could not get new chat messages.', []))
      ).pipe(
        map((results: RecieveChat[]) => {
          return results;
        })
      )
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

  fileNameFilter = (chatMessagesMetaData: GitHubMetaData[]): GitHubMetaData[] =>
    chatMessagesMetaData.filter(metdata => metdata['name'].match(/id_[0-9]{1,100000}\.json/));

  sortByName = (chatMessagesMetaData: GitHubMetaData[]): GitHubMetaData[] =>
    this.fileNameFilter(chatMessagesMetaData).sort((a, b) => this.idExtractor(a['name']) - this.idExtractor(b['name']));

  getChatsFromEnd = (chatMessagesMetaData: GitHubMetaData[], fromEnd: number): GitHubMetaData[] =>
    chatMessagesMetaData.slice(Math.max(chatMessagesMetaData.length - fromEnd, 0));

// name will be id_yyyy_mm_dd.json

  removeUrlParams = (rawUrl: string) =>
    new URL(rawUrl).origin + new URL(rawUrl).pathname;
}


