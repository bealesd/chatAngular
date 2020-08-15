import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { MessageService } from './message.service';
import { RecieveChat, SendChat } from './chatObject'

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatRepo {
  private baseUrl = 'https://estherchatapinodeazure.azurewebsites.net/';

  httpOptions = {
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

  getLastTen(): Observable<RecieveChat[]> {
    return this.http.get<RecieveChat[]>(this.getMessagesUrl(10))
      .pipe(
        retry(10),
        tap(x => x.length ?
          this.log('fetched chats') :
          this.log('no chat messages found')
        ),
        catchError(this.handleError<RecieveChat[]>('getLastTen', []))
      );
  }

  getNewChatMessages(rowKey: string): Observable<RecieveChat[]> {
    return this.http.get<RecieveChat[]>(this.getNewMessagesUrl(rowKey))
      .pipe(
        retry(10),
        tap(x => x.length ?
          this.log('fetched new chats') :
          this.log('no new chat messages found')
        ),
        catchError(this.handleError<RecieveChat[]>('getNewChatMessages', []))
      );
  }

  checkForUpdatedMessage(rowKey: string): Observable<RecieveChat> {
    return this.http.get<RecieveChat>(this.getMessageUrl(rowKey))
      .pipe(
        retry(10),
        tap(x => x === undefined || x === null ?
          this.log('fetched updated chat') :
          this.log('chat not found')
        ),
        catchError(this.handleError<RecieveChat>('checkForUpdatedMessage' ))
      );
  }

  postMessage(message: SendChat): Observable<RecieveChat> {
    return this.http.post<RecieveChat>(this.postMessageUrl(), message, this.httpOptions)
      .pipe(
        catchError(this.handleError<RecieveChat>('posted message'))
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
    };
  }
}
