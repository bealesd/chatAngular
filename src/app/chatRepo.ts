import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { MessageService } from './message.service';
import { RecieveChat, SendChat } from './chatObject'

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

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

  private getMessagesUrl(messageCount: number):string{
    return this.baseUrl + `GetMessages?recordCount=${messageCount}`;
  }

  private postMessageUrl():string{
    return this.baseUrl + `postMessage`;
  }

  getLastTen(): Observable<RecieveChat[]>{
    return this.http.get<RecieveChat[]>(this.getMessagesUrl(4))
    .pipe(
      tap(x => x.length ? 
        this.log('fetched chats'):
        this.log('no chat messages found')
        ),
      catchError(this.handleError<RecieveChat[]>('getLastTen', []))
    );
  }

  postMessage(post: SendChat): Observable<string>{
    return this.http.post<string>(this.postMessageUrl(), post, this.httpOptions)
    .pipe(
      tap((newPost: string) =>  this.log(`Posted messgage.`)),
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