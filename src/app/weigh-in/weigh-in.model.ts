export class WeighIn {
  public Date: Date;
  public David: number;
  public Esther: number;

  public ToString(): string {
    return `Datetime: ${this.Date}. David: ${this.David}. Esther: ${this.Esther}.`;
  }
}
