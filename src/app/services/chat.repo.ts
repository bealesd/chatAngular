import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, forkJoin, from, } from 'rxjs';
import { map, retry, mergeMap, defaultIfEmpty } from 'rxjs/operators';

import { RecieveChat } from '../models/recieve-chat.model';
import { SendChat } from '../models/send-chat.model';
import { GitHubMetaData } from '../models/gitHubMetaData'

import { RestHelper } from '../helpers/rest-helper';
import { FileApiFactory, FileApi } from './file-api';
import { NotepadMetadata } from '../models/notepad-models';

@Injectable({
  providedIn: 'root'
})
export class ChatRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/chatStore/contents';
  fileApi: FileApi;

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private fileApiFactory: FileApiFactory) {
    this.fileApi = this.fileApiFactory.create();
    this.fileApi.dir = '/chatStore';
  }

  getMessageListings() {
    return from(this.fileApi.listFilesAndFoldersAsync());
  }

  getLastTen(): Observable<any> {
    let asyncChats = async () => {
      let files = await this.fileApi.listFilesAndFoldersAsync()
      let contents = [];
      //use promise.all
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let content = await this.fileApi.getFileAsync(file.name);
        contents.push(content);
      }
      return this.parseGitHubResults2(contents);
    }
    return from(asyncChats());
  }

  parseGitHubResults2(results: any[]): RecieveChat[] {
    if (results === null || results === undefined || results.length === 0) return [];
    return results.map((result) => this.parseGitHubResult2(result));
  }

  parseGitHubResult2(content: string): RecieveChat {
    const chatObject = JSON.parse(atob(content));
    const recieveChat = new RecieveChat();
    recieveChat.Content = chatObject.Content;
    recieveChat.Deleted = chatObject.Deleted;
    recieveChat.Who = chatObject.Who;
    recieveChat.Datetime = chatObject.Datetime;
    recieveChat.Id = chatObject.Id;
    return recieveChat;
    // need file name ??
  }

  getLastTen2(): Observable<RecieveChat[]> {
    return from(this.fileApi.listFilesAndFoldersAsync())
      .pipe(
        map((messagesMetaData: NotepadMetadata[]) => {
          messagesMetaData = this.getChatsFromEnd(this.sortByName(messagesMetaData), 10);
          const chatUrls: Observable<any>[] = [];
          for (let i = 0; i < Object.keys(messagesMetaData).length; i++) {
            const messageMetaData = messagesMetaData[i];
            let a = this.http.get<any>(this.restHelper.removeUrlParams(messageMetaData['git_url']), this.restHelper.options());
            chatUrls.push(this.http.get<any>(this.restHelper.removeUrlParams(messageMetaData['git_url']), this.restHelper.options()));
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
    if (results === null || results === undefined || results.length === 0) return [];
    return results.map((result) => this.parseGitHubResult(result));
  }

  getNewChatMessages(lastId: number): Observable<RecieveChat[]> {
    if (lastId === null)
      return this.getLastTen();

    return from(this.fileApi.listFilesAndFoldersAsync())
      .pipe(
        map((messagesMetaData: NotepadMetadata[]) => {
          messagesMetaData = this.sortByName(messagesMetaData);
          const chatUrls = [];
          for (let i = 0; i < Object.keys(messagesMetaData).length; i++) {
            const messageMetaData = messagesMetaData[i];
            if (this.idExtractor(messageMetaData.name) > lastId)
              chatUrls.push(this.http.get<any>(this.restHelper.removeUrlParams(messageMetaData['git_url'])), this.restHelper.options());
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
    return this.http.get<any>(`${this.baseMessagesUrl}/id_${id}.json`, this.restHelper.options())
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

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.restHelper.options())
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

    return this.http.put(postUrl, rawCommitBody, this.restHelper.options())
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

    return this.http.request('delete', deletetUrl, { body: rawCommitBody, headers: this.restHelper.options().headers })
  }

  // helpers
  idExtractor = (fileName: string): number =>
    parseInt(fileName.match(/[0-9]{1,100000}/)[0]);

  fileNameFilter = (chatMessagesMetaData: NotepadMetadata[]): NotepadMetadata[] =>
    chatMessagesMetaData.filter(metdata => metdata['name'].match(/id_[0-9]{1,100000}\.json/));

  sortByName = (chatMessagesMetaData: NotepadMetadata[]): NotepadMetadata[] =>
    this.fileNameFilter(chatMessagesMetaData).sort((a, b) => this.idExtractor(a.name) - this.idExtractor(b.name));

  getChatsFromEnd = (chatMessagesMetaData: NotepadMetadata[], fromEnd: number): NotepadMetadata[] =>
    chatMessagesMetaData.slice(Math.max(chatMessagesMetaData.length - fromEnd, 0));
}
