import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, forkJoin, } from 'rxjs';
import { map, retry, mergeMap, defaultIfEmpty } from 'rxjs/operators';

import { RecieveChat } from '../models/recieve-chat.model';
import { SendChat } from '../models/send-chat.model';
import { GitHubMetaData } from '../gitHubMetaData'

import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class ChatRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/chatStore/contents';

  constructor(
    private cryptoService: CryptoService,
    private http: HttpClient) { }

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
            chatUrls.push(this.http.get<any>(this.removeUrlParams(messageMetaData['git_url']),  this.options()));
          }
          return chatUrls;
        }),
        mergeMap((chatUrls) => {
          return forkJoin(chatUrls);
        }))
      .pipe(
        map((results: any[]) => {
          return this.parseGitHubResults(results);
        })
      )
  }

  parseGitHubResult(gitHubResult: any): RecieveChat {
    const chatObject = JSON.parse(atob(atob(gitHubResult.content)));
    const recieveChat = new RecieveChat();
    recieveChat.Sha = gitHubResult.sha;
    recieveChat.Content = chatObject.Content;
    recieveChat.Deleted = chatObject.Deleted;
    recieveChat.Who = chatObject.Who;
    recieveChat.Datetime = chatObject.Datetime;
    recieveChat.Id = chatObject.Id;
    return recieveChat;
  }

  parseGitHubResults(results: any[]): RecieveChat[] {
    const recievedChats = [];
    results.forEach((result) => { recievedChats.push(this.parseGitHubResult(result)); });
    return recievedChats;
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
              chatUrls.push(this.http.get<any>(this.removeUrlParams(messageMetaData['git_url'])),  this.options());
          }
          return chatUrls;
        }),
        mergeMap((chatUrls) => {
          return forkJoin(chatUrls).pipe(
            defaultIfEmpty(null),
          );
        })
      ).pipe(
        map((gitHubResults: any[]) => {
          return this.parseGitHubResults(gitHubResults);
        })
      )
  }

  checkForUpdatedMessage(id: number): Observable<RecieveChat> {
    return this.http.get<any>(`${this.baseMessagesUrl}/id_${id}.json`, this.options())
      .pipe(
        retry(10)
      ).pipe(
        map((gitHubResult: any) => {
          return this.parseGitHubResult(gitHubResult);
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


