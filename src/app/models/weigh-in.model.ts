export class WeighIn {
  public Id: number;
  public Date: Date;
  public David: number;
  public Esther: number;

  public toString(): string {
    return `Datetime: ${this.Date.toISOString().split('T')[0]}. David: ${this.David}. Esther: ${this.Esther}.`;
  }
}