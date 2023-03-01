export class CalendarRecord {
  public id?: number;
  public what: string;
  public description: string;
  public dateTime: Date;

  toJsonString(): string {
    const json = JSON.stringify(this);
    return json;
  }

  constructor() {}
}
