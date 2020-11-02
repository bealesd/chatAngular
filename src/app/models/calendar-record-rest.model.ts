import { CalendarRecord } from './calendar-record.model';

export class CalendarRecordRest {
  records: CalendarRecord[] = [];
  sha: string = '';
  year: number;
  month: number;

  daysEnum = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  };

  get weekdayNames(): string[] {
    return Object.keys(this.daysEnum);
  }
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

  getDayRangeForWeek(week: number) {
    if (week > this.weeksInMonth || week < 1) {
      console.error(`Week is out of range for year and month: ${this.year} ${this.month}.`);
      return null;
    }

    const lastDayOfMonth = this.daysInMonthArray.slice(-1)[0];
    const firstOfMonth = new Date(this.year, this.month, 1);

    const daysIntoFirstWeek = firstOfMonth.getDay();

    let startDay = ((week - 1) * 7) - daysIntoFirstWeek;
    let endDay = startDay + 7;
    startDay = startDay < 0 ? 0 : startDay;

    let validDays = this.daysInMonthArray.slice(startDay, endDay);
    return validDays
  }

  getDaysForWeekOutsideOfMonth(week): any[] {
    let days = this.getDayRangeForWeek(week);
    if (week === 1) {
      let totalDaysInPreviousMonth = 7 - days.length;
      return this.getDaysInPreviousMonth(totalDaysInPreviousMonth);
    }
    else if (week === this.weeksInMonth) {
      let totalDaysInNextMonth = 7 - days.length;
      return this.getDaysInNextMonth(totalDaysInNextMonth);
    }
    else return [];
  }

  getDaysInPreviousMonth(totalDays) {
    let emptyDays = [];
    for (let daysIntoPreviousMonth = totalDays - 1; daysIntoPreviousMonth >= 0; daysIntoPreviousMonth--) {
      const date = new Date(this.year, this.month, -daysIntoPreviousMonth);
      emptyDays.push({ 'name': this.weekdayNames[date.getDay()], 'dayInMonthArrayIndex': date.getDate(), 'date':date  });
    }
    return emptyDays;
  }

  getDaysInNextMonth(totalDays) {
    let emptyDays = [];
    let days = this.getDayRangeForWeek(this.weeksInMonth);
    let lastDayOfMonth = this.daysInMonthArray.slice(-1)[0];
    for (let daysIntoNextMonth = 1; daysIntoNextMonth <= totalDays; daysIntoNextMonth++) {
      console.log('col' + ` ${days.length + daysIntoNextMonth}`);
      const date = new Date(this.year, this.month, lastDayOfMonth + daysIntoNextMonth);
      emptyDays.push({ 'name': this.weekdayNames[date.getDay()], 'dayInMonthArrayIndex': date.getDate(), 'date':date });
    }
    return emptyDays;
  }

  getRecordsByWeek(week: number): CalendarRecord[] {
    const dayRange = this.getDayRangeForWeek(week);
    if (dayRange === null) return [];

    const records = [];
    for (let i = 0; i < dayRange.length; i++) {
      let day = dayRange[i];
      records.push(...this.getRecordsByDay(day));
    }

    return records;
  }

  getEmptyDaysByWeek(week: number): number[] {
    const dayRange = this.getDayRangeForWeek(week);
    if (dayRange === null) return [];

    const emptyDays = [];
    for (let i = 0; i < dayRange.length; i++){
      let day = dayRange[i];
      if (this.getRecordsByDay(day).length === 0) emptyDays.push(day);
    }
     
    return emptyDays;
  }

  get weeksInMonth(): number {
    const firstOfMonth = new Date(this.year, this.month, 1);
    const daysIntoWeek = firstOfMonth.getDay();
    return Math.ceil((daysIntoWeek + this.daysInMonth) / 7);
  }

  get daysInMonthArray(): number[] {
    const days: number[] = [];
    for (let i = 1; i <= (this.daysInMonth); i++) days.push(i);
    return days;
  }

  getRecordsByDay(day: number): CalendarRecord[] {
    const records = this.records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

  getEmpytDays(): number[] {
    const emptyDays: number[] = [];
    const days = this.records.map(r => r['day']);
    for (let day = 1; day <= this.daysInMonth; day++) {
      if (!days.includes(day))
        emptyDays.push(day);
    }
    return emptyDays;
  }

  getRecordsGroupedByHourForDay(calendarDay): { hour: number, records: CalendarRecord[] }[] {
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

  get daysInMonth(): number {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(this.year, this.month + 1, 0).getDate();
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
