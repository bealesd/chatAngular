import { Injectable } from '@angular/core';
import { Observable, from, } from 'rxjs';

import { RecieveChat } from '../models/recieve-chat.model';
import { SendChat } from '../models/send-chat.model';

import { FileApiFactory, FileApi } from './file-api';
import { NotepadMetadata } from '../models/notepad-models';

@Injectable({
  providedIn: 'root'
})
export class ChatRepo {
  fileApi: FileApi;

  constructor(
    private fileApiFactory: FileApiFactory) {
    this.fileApi = this.fileApiFactory.create();
    this.fileApi.dir = '/chatStore';
  }

  getMessageListings(): Observable<NotepadMetadata[]> {
    return from(this.fileApi.listFilesAndFoldersAsync());
  }

  async getLastTen(): Promise<RecieveChat[]> {
    let files = await this.fileApi.listFilesAndFoldersAsync();
    if (files === null) return null;

    files = this.getChatsFromEnd(this.sortByName(files), 10);

    const contents: RecieveChat[] = [];
    const promises = files.map(async (file) => {
      const content = await this.fileApi.getFileAsync(file.name);
      contents.push(this.parseChatJson(JSON.parse(content).content));
    });
    await Promise.all(promises);
    return contents;
  }

  async getNewChatMessages(lastId: number): Promise<RecieveChat[]> {
    if (lastId === null)
      return await this.getLastTen();

    let files = await this.fileApi.listFilesAndFoldersAsync()
    if (files === null) return null;
    else files = this.sortByName(files);

    const contents: RecieveChat[] = [];
    const promises = files.map(async (file) => {
      if (this.idExtractor(file.name) > lastId) {
        const content = await this.fileApi.getFileAsync(file.name);
        contents.push(this.parseChatJson(JSON.parse(content).content));
      }
    });
    await Promise.all(promises);
    return contents;
  }

  async checkForUpdatedMessage(id: number): Promise<RecieveChat> {
    let file = await this.fileApi.getFileAsync(`id_${id}.json`);
    if (!file) return null;
    return this.parseChatJson(JSON.parse(file).content);
  }

  async postMessage(message: SendChat): Promise<RecieveChat> {
    const newMessage: RecieveChat = {
      Who: message.Who,
      Content: message.Content,
      Deleted: 'false',
      Id: message.Id,
      Datetime: new Date().getTime()
    }

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by ${message.Who} at ${new Date().toLocaleString()}`,
      "content": JSON.stringify(newMessage)
    })

    const result = await this.fileApi.newFileAsync(`id_${message.Id}.json`, rawCommitBody);
    if (!result) return null;

    newMessage.Sha = result.sha;
    return newMessage;
  }

  async softDeleteMessage(message: RecieveChat, deleteFlag: boolean): Promise<RecieveChat> {
      const newMessage = <SendChat>message;
      newMessage.Deleted = deleteFlag ? 'true' : 'false';

      const rawCommitBody = JSON.stringify({
        'message': `Api commit by ${newMessage.Who} at ${new Date().toLocaleString()}`,
        'content': JSON.stringify(newMessage),
        'sha': message.Sha
      });

      const result = await this.fileApi.editFileAsync(`id_${message.Id}.json`, rawCommitBody);
      message.Sha = result.sha;
      return message;
  }

  async hardDeleteMessage(message: RecieveChat): Promise<Boolean> {
      const result = await this.fileApi.deleteFileAsync(`id_${message.Id}.json`);
      return result;
  }

  // helpers
  parseChatJson(content: string): RecieveChat {
    const chatObject = JSON.parse(content);
    const recieveChat = new RecieveChat();
    recieveChat.Content = chatObject.Content;
    recieveChat.Deleted = chatObject.Deleted;
    recieveChat.Who = chatObject.Who;
    recieveChat.Datetime = chatObject.Datetime;
    recieveChat.Id = chatObject.Id;
    return recieveChat;
  }

  idExtractor = (fileName: string): number =>
    parseInt(fileName.match(/[0-9]{1,100000}/)[0]);

  fileNameFilter = (chatMessagesMetaData: NotepadMetadata[]): NotepadMetadata[] =>
    chatMessagesMetaData.filter(metdata => metdata['name'].match(/id_[0-9]{1,100000}\.json/));

  sortByName = (chatMessagesMetaData: NotepadMetadata[]): NotepadMetadata[] =>
    this.fileNameFilter(chatMessagesMetaData).sort((a, b) => this.idExtractor(a.name) - this.idExtractor(b.name));

  getChatsFromEnd = (chatMessagesMetaData: NotepadMetadata[], fromEnd: number): NotepadMetadata[] =>
    chatMessagesMetaData.slice(Math.max(chatMessagesMetaData.length - fromEnd, 0));
}
