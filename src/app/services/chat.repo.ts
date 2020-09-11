import { Injectable } from '@angular/core';

import { Observable, of, forkJoin, } from 'rxjs';
import { catchError, map, tap, retry, mergeMap, defaultIfEmpty } from 'rxjs/operators';

import { MessageService } from '../services/message.service';
import { RecieveChat } from '../models/recieve-chat.model';
import { SendChat } from '../models/send-chat.model';
import { GitHubMetaData } from '../gitHubMetaData'

import { CryptoService } from './crypto.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/chatStore/contents';
  private baseRawMessagesUrl = 'https://raw.githubusercontent.com/bealesd/chatStore/master';

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
          const chatUrls = [];
          for (let i = 0; i < Object.keys(messagesMetaData).length; i++) {
            const messageMetaData = messagesMetaData[i];
            if (this.idExtractor(messageMetaData.name) > lastId)
              chatUrls.push(this.http.get<RecieveChat>(this.removeUrlParams(messageMetaData.download_url)));
          }
          return chatUrls;
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

  checkForUpdatedMessage(id: number): Observable<RecieveChat> {
    return this.http.get<RecieveChat>(`${this.baseRawMessagesUrl}/id_${id}.json`, this.options())
      .pipe(
        retry(10),
        tap(x => x === null || x === undefined ? this.log(`Message id ${x.Id} updated.`) : null),
        catchError(this.handleError<RecieveChat>(`Could not check for updated message, id ${id}.`, null))
      );
  }

  postMessage(message: SendChat): Observable<RecieveChat> {
    const postUrl = this.baseMessagesUrl + `/id_${message.Id}.json`;

    const newMessage: RecieveChat = {
      Who: message.Who,
      Content: message.Content,
      Deleted: 'false',
      Id: message.Id,
      Datetime: new Date().getTime()
    }

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by ${message.Who} at ${new Date().toLocaleString()}`,
      "content": btoa(JSON.stringify(newMessage))
    })

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.options())
      .pipe(
        map((result: { content: GitHubMetaData }) => {
          let metadata = <GitHubMetaData>result['content'];
          newMessage.Sha = metadata.sha;
          return <RecieveChat>newMessage;
        }),
        catchError(this.handleError<RecieveChat>('Could not post message.', null))
      );
  }

  softDeleteMessage(message: RecieveChat, deleteFlag: boolean): Observable<RecieveChat> {
    const postUrl = this.baseMessagesUrl + `/id_${message.Id}.json`;

    const newMessage = <SendChat>message;
    newMessage.Deleted = deleteFlag ? 'true' : 'false';

    const rawCommitBody = JSON.stringify({
      'message': `Api commit by ${newMessage.Who} at ${new Date().toLocaleString()}`,
      'content': btoa(JSON.stringify(newMessage)),
      'sha': message.Sha
    })

    return this.http.put(postUrl, rawCommitBody, this.options())
      .pipe(
        map((result: { content: GitHubMetaData }) => {
          let metadata = result.content;
          message.Sha = metadata.sha;
          return <RecieveChat>message;
        }),
        catchError(this.handleError<RecieveChat>(`Could not update delete flag, message id ${message.Id}.`, null))
      );
  }

  hardDeleteMessage(message: RecieveChat): Observable<any> {
    const deletetUrl = this.baseMessagesUrl + `/id_${message.Id}.json`;
    const commitBody = {
      "message": `Api delete commit by ${message.Who} at ${new Date().toLocaleString()}`,
      "sha": `${message.Sha}`
    }
    const rawCommitBody = JSON.stringify(commitBody);

    return this.http.request('delete', deletetUrl, { body: rawCommitBody, headers: this.options().headers })
      .pipe(
        catchError(this.handleError<string>(`Could not delete message id ${message.Id}.`))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`Failed REST request. ${operation} ${error.message}.`);
      return of(result as T);
    }
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

  removeUrlParams = (rawUrl: string) =>
    new URL(rawUrl).origin + new URL(rawUrl).pathname;
}


