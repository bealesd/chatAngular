export class CalendarRecord {
  id: string;
  what: string;
  day: number;
  hour: number;
  minute: number;
  // month: number;

  constructor(id, what, day, hour, minute) {
    this.id = id;
    this.what = what;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    // this.month = month;
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
