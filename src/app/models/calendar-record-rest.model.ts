import { CalendarRecord } from './calendar-record.model';

export class CalendarRecordRest {
  records: CalendarRecord[] = [];
  sha: string = '';
  year: number;
  month: number;

  get key(): string {
    if (this.year !== null && this.year !== undefined && this.month !== null && this.month !== undefined)
      return `${this.year}-${this.month}`;
    else
      return null;
  }

  constructor() { }

  toJsonString(): string {
    let jsonRecords = [];
    for (let i = 0; i < this.records.length; i++) {
      const record = this.records[i];
      jsonRecords.push(JSON.parse(record.toJsonString()));
    }
    return JSON.stringify(jsonRecords);
  }

  getCalendardRecordHourGroupsByDay(calendarDay): { hour: number, records: CalendarRecord[] }[] {
    const records = this.getRecordsByDay(calendarDay);

    const grouped: { hour: CalendarRecord[] } = this.groupBy(records, 'hour');

    const allGroupedRecords: { 'hour': number, 'records': CalendarRecord[] }[] = [];
    for (let i = 0; i < Object.keys(grouped).length; i++) {
      const hour = Object.keys(grouped)[i];
      allGroupedRecords.push({
        'hour': parseInt(hour),
        'records': grouped[hour]
      });
    }
    return allGroupedRecords;
  }

  getRecordsByDay(day: number): CalendarRecord[] {
    const records = this.records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

  getEmptyHoursByDay(calendarDay): any[] {
    const records = this.getRecordsByDay(calendarDay);
    return this.hoursOfDay.filter(hour => !records.map(rec => rec.hour).includes(hour.value));
  }

  get hoursOfDay(): any[] {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = {
        toString: () => { return this.padToTwo(i) },
        value: i
      };
      hours.push(hour);
    }
    return hours;
  }

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

  private groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  private compareByTime(a, b) {
    const is_hour_a_before_b = a.hour < b.hour ? true : (a.hour === b.hour ? null : false);
    const is_minute_a_before_b = a.minute < b.minute ? true : (a.minute === b.minute ? null : false);

    const is_a_before_b = is_hour_a_before_b || (is_hour_a_before_b === null && is_minute_a_before_b);
    const is_a_same_as_b = is_hour_a_before_b === null && is_minute_a_before_b === null;

    return is_a_before_b ? -1 : (is_a_same_as_b ? 1 : 0);
  }
}
