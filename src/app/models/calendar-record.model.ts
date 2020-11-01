export class CalendarRecord {
  id: string;
  what: string;

  private _hour: number;
  get hour() { return this._hour; }
  set hour(hour: number) { if (!isNaN(hour)) this._hour = parseInt(`${hour}`); }

  private _minute: number;
  get minute() { return this._minute; }
  set minute(minute: number) { if (!isNaN(minute)) this._minute = parseInt(`${minute}`); }

  private _day: number;
  get day() { return this._day; }
  set day(day: number) { if (!isNaN(day)) this._day = parseInt(`${day}`); }

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
}
