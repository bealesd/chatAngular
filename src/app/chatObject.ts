export class RecieveChat{
    public Id : number;
    public Who : string;
    public Datetime : number;
    public Content : string;
    public Deleted : string;
    public Sha? : string;
}

export class SendChat{
  public Id : number;
  public Who : string;
  public Datetime : number;
  public Content : string;
  public Deleted : string;
}
