export class CalendarRecord {
  public id?: number;
  public what: string;
  public year: number;
  public month: number;
  public day: number;
  public hour: number;
  public minute: number;

  toJsonString(): string {
    const json = JSON.stringify(this);
    return json;
  }

  constructor(id: number, what:string, year:number, month:number, day:number, hour:number, minute:number) {
    this.id = id;
    this.what = what;
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
  }
}
