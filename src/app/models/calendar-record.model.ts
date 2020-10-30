export class CalendarRecord {
  id: string;
  what: string;
  day: number;
  hour: number;
  minute: number

  constructor(jsonImport: CalendarRecord) {
    this.id = jsonImport.id;
    this.what = jsonImport.what;
    this.day = jsonImport.day;
    this.hour = jsonImport.minute;
  }

  get paddedHour(): string {
    return this.padToTwo(this.hour);
  }

  get paddeMinute(): string {
    return this.padToTwo(this.hour);
  }

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }
}
