export class CalendarRecord {
  public Id?: number;
  public What: string;
  public Description: string;
  public DateTime: Date;

  toJsonString(): string {
    const json = JSON.stringify(this);
    return json;
  }

  constructor() {}
}
