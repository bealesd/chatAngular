export class Chat {
  public Id: number;
  //TODO change to sender
  public Name: string;
  public Message: string;
  public Datetime: number;
  //TODO change to chat group guid
  public Guid: string;

  public ToString(): string {
    return `Id: ${this.Id}. Who: ${this.Name}. Content: ${this.Message}. Datetime: ${this.Datetime}.`;
  }
}

export class ChatRead {
  public Id: number;
  public UsernameId: number;
  public ChatId: number;
  public Datetime: number;

  public ToString(): string {
    return `Id: ${this.Id}. UsernameId: ${this.UsernameId}. ChatId: ${this.ChatId}. Datetime: ${this.Datetime}.`;
  }
}

