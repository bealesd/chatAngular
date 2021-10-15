export class Chat {
  public Id: number;
  public Who: string;
  public Content: string;
  public Datetime: number;

  public ToString(): string{
    return `Id: ${this.Id}. Who: ${this.Who}. Content: ${this.Content}. Datetime: ${this.Datetime}.`;
  }
}
