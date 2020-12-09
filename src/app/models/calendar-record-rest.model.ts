import { CalendarRecord } from './calendar-record.model';

export class CalendarRecordRest {
  records: CalendarRecord[] = [];
  // sha: string = '';
  // todo store notepad metadata here
  year: number;
  month: number;

  get key(): string {
    if (this.year !== null && this.year !== undefined && this.month !== null && this.month !== undefined)
      return `${this.year}-${this.month}`;
    else return null;
  }

  toJsonString(): string {
    return JSON.stringify(this.records.map(record => JSON.parse(record.toJsonString())));
  }

  getDayRangeForWeek(week: number) {
    if (week > this.weeksInMonth || week < 1)
      return console.error(`Week is out of range for year and month: ${this.year} ${this.month}.`) === null ? [] : [];

    const firstOfMonth = new Date(this.year, this.month, 1);
    const daysIntoFirstWeek = firstOfMonth.getDay();

    let startDay = ((week - 1) * 7) - daysIntoFirstWeek;
    const endDay = startDay + 7;
    startDay = startDay < 0 ? 0 : startDay;

    return this.daysInMonthArray.slice(startDay, endDay);
  }

  getDaysForWeek(week: number) {
    return this.getDayRangeForWeek(week).map(day => new Date(this.year, this.month, day));
  }

  getDaysForWeekOutsideOfMonth(week): any[] {
    const days = this.getDayRangeForWeek(week);
    if (days.length === 0)
      return [];
    else if (week === 1)
      return this.getDaysInPreviousMonth(7 - days.length);
    else if (week === this.weeksInMonth)
      return this.getDaysInNextMonth(7 - days.length);
    else return [];
  }

  getDaysInPreviousMonth(totalDays): Date[] {
    const emptyDays = [];
    for (let daysIntoPreviousMonth = totalDays - 1; daysIntoPreviousMonth >= 0; daysIntoPreviousMonth--)
      emptyDays.push(new Date(this.year, this.month, -daysIntoPreviousMonth));
    return emptyDays;
  }

  getDaysInNextMonth(totalDays): Date[] {
    const emptyDays = [];
    const lastDayOfMonth = this.daysInMonthArray.slice(-1)[0];
    for (let daysIntoNextMonth = 1; daysIntoNextMonth <= totalDays; daysIntoNextMonth++)
      emptyDays.push(new Date(this.year, this.month, lastDayOfMonth + daysIntoNextMonth));
    return emptyDays;
  }

  getRecordsByWeek(week: number): CalendarRecord[] {
    const dayRange = this.getDayRangeForWeek(week);
    if (dayRange === null) return [];
    return dayRange.map(day => this.getRecordsByDay(day)).flat();
  }

  getRecordsGroupedByHourAndDayForWeek(week: number): { hour: number; date: Date; records: CalendarRecord[]; }[] {
    let recordsGroupedByHour = [];
    for (let dayDate of this.getDaysForWeek(week)) {
      for (let groupedRecord of this.getRecordsGroupedByHourForDay(dayDate.getDate()))
        recordsGroupedByHour.push({ hour: groupedRecord.hour, date: dayDate, records: groupedRecord.records });
    }
    return recordsGroupedByHour
  }

  getEmptyRecordsGroupedByHourAndDayForWeek(week: number): { hour: number; date: Date; }[] {
    const emptyHoursData = [];
    for (let dayDate of this.getDaysForWeek(week)) {
      for (let emptyHour of this.getEmptyHoursByDay(dayDate.getDate()))
        emptyHoursData.push({ hour: emptyHour.value, date: dayDate });
    }
    return emptyHoursData;
  }

  get weeksInMonth(): number {
    const firstOfMonth = new Date(this.year, this.month, 1);
    const daysIntoWeek = firstOfMonth.getDay();
    return Math.ceil((daysIntoWeek + this.daysInMonth) / 7);
  }

  get daysInMonthArray(): number[] {
    return [...Array(this.daysInMonth).keys()].map(i => i + 1);
  }

  getRecordsByDay(day: number): CalendarRecord[] {
    const records = this.records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

  getRecordsGroupedByHourForDay(calendarDay): { hour: number, date: Date, records: CalendarRecord[] }[] {
    const records = this.getRecordsByDay(calendarDay);
    const grouped: { hour: CalendarRecord[] } = this.groupBy(records, 'hour');

    return Object.keys(grouped).map(hour => Object({
      'hour': parseInt(hour), 'records': grouped[hour], 'date': new Date(this.year, this.month, calendarDay)
    }));
  }

  getEmpytDays(): number[] {
    const days = this.records.map(r => r['day']);
    return [...Array(this.daysInMonth).keys()].map(i => i + 1).filter(day => !days.includes(day));
  }

  getEmptyDaysByWeek(week: number): number[] {
    const dayRange = this.getDayRangeForWeek(week);
    if (dayRange === null) return [];
    return dayRange.filter(day => this.getRecordsByDay(day).length === 0);
  }

  getEmptyHoursByDay(calendarDay): any[] {
    const records = this.getRecordsByDay(calendarDay);
    return this.hoursOfDay.filter(hour => !records.map(rec => rec.hour).includes(hour.value));
  }

  get hoursOfDay(): any[] {
    return [...Array(24).keys()].map((hour) => Object({ toString: () => this.padToTwo(hour), value: hour }))
  }

  get daysInMonth(): number {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

  private groupBy(xs, key) {
    return xs.reduce((rv, x) => {
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

  // [...Array(size).keys()].map(i => i + startAt);
}
