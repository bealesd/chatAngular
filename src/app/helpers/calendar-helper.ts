import { Injectable } from '@angular/core';
import { CalendarRecord } from '../models/calendar-record.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarHelper {
  getFormInputMonthFromMonthAndYear(year: number, month: number){
    const date = new Date(Date.UTC(year, month));
    const paddedMonth = date.toLocaleDateString('GB', { month: '2-digit' });
    return `${year}-${paddedMonth}`;
  }

   getDayRangeForWeek(year: number, month: number, week: number) {
    if (week > this.weeksInMonth(year, month) || week < 1)
      return console.error(`Week is out of range for year and month: ${year} ${month}.`) === null ? [] : [];

    const firstOfMonth = new Date(year, month, 1);
    const daysIntoFirstWeek = firstOfMonth.getDay();

    let startDay = ((week - 1) * 7) - daysIntoFirstWeek;
    const endDay = startDay + 7;
    startDay = startDay < 0 ? 0 : startDay;

    return this.daysInMonthArray(year, month).slice(startDay, endDay);
  }

   getDaysForWeek(year: number, month: number, week: number): Date[] {
    return this.getDayRangeForWeek(year, month, week).map(day => new Date(year, month, day));
  }

   getDaysForWeekOutsideOfMonth(year: number, month: number, week: number): Date[] {
    const days = this.getDayRangeForWeek(year, month, week);
    if (days.length === 0)
      return [];
    else if (week === 1)
      return this.getDaysInPreviousMonth(year, month, (7 - days.length));
    else if (week === this.weeksInMonth(year, month))
      return this.getDaysInNextMonth(year, month, (7 - days.length));
    else return [];
  }

   getDaysInPreviousMonth(year: number, month: number, totalDays): Date[] {
    const emptyDays = [];
    for (let daysIntoPreviousMonth = totalDays - 1; daysIntoPreviousMonth >= 0; daysIntoPreviousMonth--)
      emptyDays.push(new Date(year, month, -daysIntoPreviousMonth));
    return emptyDays;
  }

   getDaysInNextMonth(year: number, month: number, totalDays): Date[] {
    const emptyDays = [];
    const lastDayOfMonth = this.daysInMonthArray(year, month).slice(-1)[0];
    for (let daysIntoNextMonth = 1; daysIntoNextMonth <= totalDays; daysIntoNextMonth++)
      emptyDays.push(new Date(year, month, lastDayOfMonth + daysIntoNextMonth));
    return emptyDays;
  }

   getRecordsByWeek(year: number, month: number, week: number, records: CalendarRecord[]): CalendarRecord[] {
    const dayRange = this.getDayRangeForWeek(year, month, week);
    if (dayRange === null) return [];
    return dayRange.map(day => this.getRecordsByDay(day, records)).flat();
  }

   getRecordsGroupedByHourAndDayForWeek(year: number, month: number, week: number, records: CalendarRecord[]): { hour: number; date: Date; records: CalendarRecord[]; }[] {
    let recordsGroupedByHour = [];
    for (let dayDate of this.getDaysForWeek(year, month, week)) {
      for (let groupedRecord of this.getRecordsGroupedByHourForDay(year, month, dayDate.getDate(), records))
        recordsGroupedByHour.push({ hour: groupedRecord.hour, date: dayDate, records: groupedRecord.records });
    }
    return recordsGroupedByHour
  }

   getEmptyRecordsGroupedByHourAndDayForWeek(year: number, month: number, week: number, records: CalendarRecord[]): { hour: number; date: Date; }[] {
    const emptyHoursData = [];
    for (let dayDate of this.getDaysForWeek(year, month, week)) {
      for (let emptyHour of this.getEmptyHoursByDay(dayDate.getDate(), records))
        emptyHoursData.push({ hour: emptyHour.value, date: dayDate });
    }
    return emptyHoursData;
  }

   weeksInMonth(year: number, month: number,): number {
    const firstOfMonth = new Date(year, month, 1);
    const daysIntoWeek = firstOfMonth.getDay();
    return Math.ceil((daysIntoWeek + this.daysInMonth(year, month)) / 7);
  }

   getRecordsByDay(day: number, records: CalendarRecord[]): CalendarRecord[] {
    records = records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

   getRecordsGroupedByHourForDay(year: number, month: number, calendarDay, records: CalendarRecord[]): { hour: number, date: Date, records: CalendarRecord[] }[] {
    records = this.getRecordsByDay(calendarDay, records);
    const grouped: { hour: CalendarRecord[] } = this.groupBy(records, 'hour');

    return Object.keys(grouped).map(hour => Object({
      'hour': parseInt(hour), 'records': grouped[hour], 'date': new Date(year, month, calendarDay)
    }));
  }

   getEmpytDays(records: CalendarRecord[]): number[] {
    const days = records.map(r => r['day']);
    return [...Array(this.daysInMonth).keys()].map(i => i + 1).filter(day => !days.includes(day));
  }

   getEmptyDaysByWeek(year: number, month: number, week: number, records: CalendarRecord[]): number[] {
    const dayRange = this.getDayRangeForWeek(year, month, week);
    if (dayRange === null) return [];
    return dayRange.filter(day => this.getRecordsByDay(day, records).length === 0);
  }

   getEmptyHoursByDay(calendarDay, records: CalendarRecord[]): any[] {
    records = this.getRecordsByDay(calendarDay, records);
    return this.hoursOfDay().filter(hour => !records.map(rec => rec.hour).includes(hour.value));
  }

   hoursOfDay(): any[] {
    return [...Array(24).keys()].map((hour) => Object({ toString: () => this.padToTwo(hour), value: hour }))
  }

  private  padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

  private  groupBy(xs, key) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  private  compareByTime(a, b) {
    const is_hour_a_before_b = a.hour < b.hour ? true : (a.hour === b.hour ? null : false);
    const is_minute_a_before_b = a.minute < b.minute ? true : (a.minute === b.minute ? null : false);

    const is_a_before_b = is_hour_a_before_b || (is_hour_a_before_b === null && is_minute_a_before_b);
    const is_a_same_as_b = is_hour_a_before_b === null && is_minute_a_before_b === null;

    return is_a_before_b ? -1 : (is_a_same_as_b ? 1 : 0);
  }

   getDayName(dayNumber: number): string {
    return Object.keys(this.daysEnum)[dayNumber];
  }

   getDayNameShortForMonth(year: number, month: number, day: number): string {
    const date = new Date(year, month, day);
    return this.getDayName(date.getDay());
  }

   getDayNameLongForMonth(year: number, month: number, day: number): string {
    const date = new Date(year, month, day);
    return this.getDayNameLong(date.getDay(), this.daysLongEnum);
  }

   getDayNameLong(dayNumber: number, daysLongEnum): string {
    return Object.keys(daysLongEnum)[dayNumber];
  }

   years() {
    const years: number[] = [];
    for (let i = 2020; i < 2040; i++) {
      years.push(i);
    }
    return years;
  }

  monthNames(): string[] {
    return Object.keys(this.monthsEnum);
  }

   monthNamesShort(): string[] {
    return Object.keys(this.monthsShortEnum);
  }

   daysInMonth(year: number, month: number): number {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(year, month + 1, 0).getDate();
  }

  public  daysInMonthArray(year: number, month: number): number[] {
    const days: number[] = [];
    for (let i = 1; i <= (this.daysInMonth(year, month)); i++) days.push(i);
    return days;
  }

   daysEnum = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  };

   daysLongEnum = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

   weekdayNames(): string[] {
    return Object.keys(this.daysEnum);
  }

   monthsEnum = {
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11
  }

   monthsShortEnum = {
    "Jan": 0,
    "Feb": 1,
    "Mar": 2,
    "Apr": 3,
    "May": 4,
    "Jun": 5,
    "Jul": 6,
    "Aug": 7,
    "Sep": 8,
    "Oct": 9,
    "Nov": 10,
    "Dec": 11
  }

  public  addOrdinalIndictor(day: number): string {
    const j = day % 10;
    const k = day % 100;
    let ordinalIndictor;
    if (j == 1 && k != 11)
      ordinalIndictor = "st";
    else if (j == 2 && k != 12)
      ordinalIndictor = "nd";
    else if (j == 3 && k != 13)
      ordinalIndictor = "rd";
    else
      ordinalIndictor = "th";
    return ordinalIndictor;
  }
}
