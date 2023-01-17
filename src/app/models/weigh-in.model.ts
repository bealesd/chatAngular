export class WeighIn {
  public Id: number;
  public Date: Date;
  public DavidStone : number;
  public DavidPounds : number;
  public EstherStone : number;
  public EstherPounds: number;

  public toString(): string {
    return `Datetime: ${this.Date.toISOString().split('T')[0]}. David: ${this.DavidStone}.${this.DavidPounds} . Esther: ${this.EstherStone}.${this.EstherPounds} .`;
  }
}
