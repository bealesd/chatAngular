import { Injectable } from '@angular/core';
import { CalendarRecord } from '../models/calendar-record.model';

import { compareAsc, getDate } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class CalendarHelper {
  getFormInputMonthFromMonthAndYear(year: number, month: number) {
    const date = new Date(Date.UTC(year, month));
    const paddedMonth = date.toLocaleDateString('GB', { month: '2-digit' });
    return `${year}-${paddedMonth}`;
  }

  getRecordsByDay(day: number, records: CalendarRecord[]): CalendarRecord[] {
    records = records.filter(record => getDate(record.dateTime) === day);
    records.sort((a, b) => compareAsc(a.dateTime, b.dateTime));
    return records;
  }

  hoursOfDay(): any[] {
    return [...Array(24).keys()].map((hour) => Object({ toString: () => this.padToTwo(hour), value: hour }))
  }

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

  daysInMonth(year: number, month: number): number {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(year, month + 1, 0).getDate();
  }

  public daysInMonthArray(year: number, month: number): number[] {
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

  weekdayNames(): string[] {
    return Object.keys(this.daysEnum);
  }

  weekdayNamesEndSunday(): string[] {
    const names = this.weekdayNames();
    names.push(names.shift());
    return names;
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

  // public addOrdinalIndictor(day: number): string {
  //   const j = day % 10;
  //   const k = day % 100;
  //   let ordinalIndictor;
  //   if (j == 1 && k != 11)
  //     ordinalIndictor = "st";
  //   else if (j == 2 && k != 12)
  //     ordinalIndictor = "nd";
  //   else if (j == 3 && k != 13)
  //     ordinalIndictor = "rd";
  //   else
  //     ordinalIndictor = "th";
  //   return ordinalIndictor;
  // }
}
