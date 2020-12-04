import { Injectable } from '@angular/core';
import { Observable, from, } from 'rxjs';

import { Chat } from '../models/chat.model';

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

  async getLastTen(): Promise<Chat[]> {
    let files = await this.fileApi.listFilesAndFoldersAsync();
    if (files === null) return null;

    files = this.getChatsFromEnd(this.sortByName(files), 10);

    const contents: Chat[] = [];
    const promises = files.map(async (file) => {
      const content = await this.fileApi.getFileAsync(file.name);
      contents.push(this.parseChatJson(content));
    });
    await Promise.all(promises);
    return contents;
  }

  async getNewChatMessages(lastId: number): Promise<Chat[]> {
    if (lastId === null)
      return await this.getLastTen();

    let files = await this.fileApi.listFilesAndFoldersAsync()
    if (files === null) return null;
    else files = this.sortByName(files);

    const contents: Chat[] = [];
    const promises = files.map(async (file) => {
      if (this.idExtractor(file.name) > lastId) {
        const content = await this.fileApi.getFileAsync(file.name);
        contents.push(this.parseChatJson(content));
      }
    });
    await Promise.all(promises);
    return contents;
  }

  async checkForUpdatedMessage(id: number): Promise<Chat> {
    let file = await this.fileApi.getFileAsync(`id_${id}.json`);
    if (!file) return null;
    return this.parseChatJson(file);
  }

  async postMessage(message: Chat): Promise<NotepadMetadata> {
    return await this.fileApi.newFileAsync(`id_${message.Id}.json`, JSON.stringify(message));
  }

  async softDeleteMessage(message: Chat): Promise<NotepadMetadata> {
    return await this.fileApi.editFileAsync(`id_${message.Id}.json`, JSON.stringify(message));
  }

  async hardDeleteMessage(message: Chat): Promise<Boolean> {
    return await this.fileApi.deleteFileAsync(`id_${message.Id}.json`);
  }

  // helpers
  parseChatJson(content: string): Chat {
    const chatObject = JSON.parse(content);
    const chat = new Chat();
    chat.Content = chatObject.Content;
    chat.Deleted = chatObject.Deleted;
    chat.Who = chatObject.Who;
    chat.Datetime = chatObject.Datetime;
    chat.Id = chatObject.Id;
    return chat;
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
