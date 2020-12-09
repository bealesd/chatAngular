import { Injectable } from '@angular/core';

import { Chat, ChatContainer } from '../models/chat.model';

import { FileApiFactory, FileApi } from './file-api';
import { ItemMetadata } from '../models/item-models';

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

  async getFile(name: string): Promise<ItemMetadata> {
    const files = await this.fileApi.listFilesAndFoldersAsync();
    if (files === [] || files === null) return null;

    const file = files.find((file) => file.name === name);
    if (file === null || file === undefined) return null;

    return file;
  }

  async getLastTen(): Promise<ChatContainer[]> {
    let files = await this.fileApi.listFilesAndFoldersAsync();
    if (files === null) return null;

    files = this.getChatsFromEnd(this.sortByName(files), 10);

    const chatContainers: ChatContainer[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await this.fileApi.getFileAsync(file.key);
      const chatContainer = new ChatContainer();
      chatContainer.metadata = file;
      chatContainer.chat = this.parseChatJson(content);
      chatContainers.push(chatContainer);
    }
    return chatContainers;
  }

  async getNewChatMessages(lastId: number): Promise<ChatContainer[]> {
    if (lastId === null)
      return await this.getLastTen();

    let files = await this.fileApi.listFilesAndFoldersAsync()
    if (files === null) return null;
    else files = this.sortByName(files);

    const chatContainers: ChatContainer[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.idExtractor(file.name) > lastId) {
        const content = await this.fileApi.getFileAsync(file.key);
        const chatContainer = new ChatContainer();
        chatContainer.metadata = file;
        chatContainer.chat = this.parseChatJson(content);
        chatContainers.push(chatContainer);
      }
    }
    return chatContainers;
  }

  async checkForUpdatedMessage(chat: ChatContainer): Promise<Chat> {
    let content = await this.fileApi.getFileAsync(chat.metadata.key);
    if (!content) return null;
    return this.parseChatJson(content);
  }

  async postMessage(message: Chat): Promise<ItemMetadata> {
    return await this.fileApi.newFileAsync(`id_${message.Id}.json`, JSON.stringify(message));
  }

  async softDeleteMessage(chat: ChatContainer): Promise<ItemMetadata> {
    return await this.fileApi.editFileAsync(chat.metadata.key, JSON.stringify(chat.chat));
  }

  async hardDeleteMessage(chat: ChatContainer): Promise<Boolean> {
    return await this.fileApi.deleteFileAsync(chat.metadata.key);
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

  fileNameFilter = (chatMessagesMetaData: ItemMetadata[]): ItemMetadata[] =>
    chatMessagesMetaData.filter(metdata => metdata['name'].match(/id_[0-9]{1,100000}\.json/));

  sortByName = (chatMessagesMetaData: ItemMetadata[]): ItemMetadata[] =>
    this.fileNameFilter(chatMessagesMetaData).sort((a, b) => this.idExtractor(a.name) - this.idExtractor(b.name));

  getChatsFromEnd = (chatMessagesMetaData: ItemMetadata[], fromEnd: number): ItemMetadata[] =>
    chatMessagesMetaData.slice(Math.max(chatMessagesMetaData.length - fromEnd, 0));
}
