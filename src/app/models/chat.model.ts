import { ItemMetadata } from './item-models';

export class Chat {
  public Id: number;
  public Who: string;
  public Datetime: number;
  public Content: string;
  public Deleted: string;
}

export class ChatContainer {
  chat: Chat
  metadata: ItemMetadata
}