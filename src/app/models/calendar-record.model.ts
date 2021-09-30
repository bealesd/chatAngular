export class CalendarRecord {
  public id?: number;
  public what: string;
  public description: string;
  public year: number;
  public month: number;
  public day: number;
  public hour: number;
  public minute: number;

  toJsonString(): string {
    const json = JSON.stringify(this);
    return json;
  }

  constructor() {}
}
