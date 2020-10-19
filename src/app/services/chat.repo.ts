import { Injectable } from '@angular/core';

import { Observable, forkJoin, } from 'rxjs';
import { map, tap, retry, mergeMap, defaultIfEmpty } from 'rxjs/operators';

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
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options());
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
            chatUrls.push(this.http.get<any>(this.removeUrlParams(messageMetaData.download_url)));
          }
          return chatUrls;
        }),
        mergeMap((chatUrls) => {
          return forkJoin(chatUrls);
        }))
      .pipe(
        map((results: any[]) => {
          results.map((chat) => { chat = atob(chat); chat.Sha = idShaLookup[chat.Id]; chat.Content = atob(chat.Content); });
          return results as RecieveChat[];
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
              chatUrls.push(this.http.get<any>(this.removeUrlParams(messageMetaData.download_url)));
          }
          return chatUrls;
        }),
        mergeMap((chatUrls) => {
          return forkJoin(chatUrls).pipe(
            defaultIfEmpty(null),
          );
        })
      ).pipe(
        map((results: any[]) => {
          results.map((chat) => { atob(chat); });
          return results as RecieveChat[];
        })
      )
  }

  checkForUpdatedMessage(id: number): Observable<RecieveChat> {
    return this.http.get<any>(`${this.baseRawMessagesUrl}/id_${id}.json`, this.options())
      .pipe(
        retry(10)
      ).pipe(
        map((chat: any) => {
          chat = atob(chat);
          return chat as RecieveChat;
        })
      )
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
      "content": btoa(btoa(JSON.stringify(newMessage)))
    })

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.options())
      .pipe(
        map((result: { content: GitHubMetaData }) => {
          let metadata = <GitHubMetaData>result['content'];
          newMessage.Sha = metadata.sha;
          return <RecieveChat>newMessage;
        })
      );
  }

  softDeleteMessage(message: RecieveChat, deleteFlag: boolean): Observable<RecieveChat> {
    const postUrl = this.baseMessagesUrl + `/id_${message.Id}.json`;

    const newMessage = <SendChat>message;
    newMessage.Deleted = deleteFlag ? 'true' : 'false';

    const rawCommitBody = JSON.stringify({
      'message': `Api commit by ${newMessage.Who} at ${new Date().toLocaleString()}`,
      'content': btoa(btoa(JSON.stringify(newMessage))),
      'sha': message.Sha
    })

    return this.http.put(postUrl, rawCommitBody, this.options())
      .pipe(
        map((result: { content: GitHubMetaData }) => {
          let metadata = result.content;
          message.Sha = metadata.sha;
          return <RecieveChat>message;
        })
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


