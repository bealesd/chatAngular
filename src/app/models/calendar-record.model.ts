export class CalendarRecord {
  id: string;
  what: string;

  private _hour: number;
  get hour() { return this._hour; }
  set hour(hour: number) { this._hour = parseInt(`${hour}`); }

  private _minute: number;
  get minute() { return this._minute; }
  set minute(minute: number) { this._minute = parseInt(`${minute}`); }

  private _day: number;
  get day() { return this._day; }
  set day(day: number) { this._day = parseInt(`${day}`); }

  toJsonString(): string {
    let json = JSON.stringify(this);

    const keysToUpdate = Object.keys(this).filter(key => key[0] === "_");
    keysToUpdate.forEach(key => {
      json = json.replace(key, key.substring(1));
    });
    
    return json;
  }

  constructor(id, what, day, hour, minute) {
    this.id = id;
    this.what = what;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
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
