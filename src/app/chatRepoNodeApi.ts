import { Injectable } from '@angular/core';

import { Observable, of} from 'rxjs';
import { catchError, tap, retry, } from 'rxjs/operators';

import { MessageService } from './message.service';
import { RecieveChatNodeApi, SendChatNodeApi } from './chatObjectNodeApi'

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatRepoNodeApi {
  private baseUrl = 'https://estherchatapinodeazure.azurewebsites.net/';

  private jsonHttpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  private log(message: string) {
    this.messageService.add(`ChatService: ${message}`);
  }

  private getMessagesUrl(messageCount: number): string {
    return this.baseUrl + `GetMessages?recordCount=${messageCount}`;
  }

  private getMessageUrl(rowKey: string): string {
    return this.baseUrl + `GetMessage?rowKey=${rowKey}`;
  }

  private getNewMessagesUrl(rowKey: string): string {
    return this.baseUrl + `getMessagesAfterRowKey?rowKey=${rowKey}`;
  }

  private postMessageUrl(): string {
    return this.baseUrl + `postMessage`;
  }

  private deleteMessageUrl(): string {
    return this.baseUrl + `deleteMessage`;
  }

  getLastTen(): Observable<RecieveChatNodeApi[]> {
    return this.http.get<RecieveChatNodeApi[]>(this.getMessagesUrl(10))
      .pipe(
        retry(10),
        tap(x => x.length ?
          this.log('fetched chats') :
          this.log('no chat messages found')
        ),
        catchError(this.handleError<RecieveChatNodeApi[]>('getLastTen', []))
      );
  }

  getNewChatMessages(rowKey: string): Observable<RecieveChatNodeApi[]> {
    return this.http.get<RecieveChatNodeApi[]>(this.getNewMessagesUrl(rowKey))
      .pipe(
        retry(10),
        tap(x => x.length ?
          this.log('fetched new chats') :
          this.log('no new chat messages found')
        ),
        catchError(this.handleError<RecieveChatNodeApi[]>('getNewChatMessages', []))
      );
  }

  checkForUpdatedMessage(rowKey: string): Observable<RecieveChatNodeApi> {
    return this.http.get<RecieveChatNodeApi>(this.getMessageUrl(rowKey))
      .pipe(
        retry(10),
        tap(x => x === undefined || x === null ?
          this.log('fetched updated chat') :
          this.log('chat not found')
        ),
        catchError(this.handleError<RecieveChatNodeApi>('checkForUpdatedMessage'))
      );
  }

  postMessage(message: SendChatNodeApi): Observable<RecieveChatNodeApi> {
    return this.http.post<RecieveChatNodeApi>(this.postMessageUrl(), message, this.jsonHttpOptions)
      .pipe(
        catchError(this.handleError<RecieveChatNodeApi>('posted message'))
      );
  }

  deleteMessage(rowKey: string): Observable<string> {
    return this.http.delete<string>(this.deleteMessageUrl() + `?rowKey=${rowKey}`)
      .pipe(
        catchError(this.handleError<string>('posted message'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);

      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    }
  }
}
