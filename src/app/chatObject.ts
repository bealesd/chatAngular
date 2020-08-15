export class RecieveChat{
    public Id : string;
    public Who : string;
    public Datetime : number;
    public Content : string;
    public RowKey : string;
    public Deleted : string;
}

export class SendChat{
    constructor(
      public Username: string,
      public Message: string,
    ) {
      this.Username = Username;
      this.Message = Message;
    }
}
