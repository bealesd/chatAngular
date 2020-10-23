import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CalendarRepo } from './calendar.repo'

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  public calendarRecords = new BehaviorSubject<any>({});

  public closeAddOrUpdateEventForm = new BehaviorSubject<boolean>(true);
  public openUpdateEventForm = new BehaviorSubject<any>({});
  public openAddEventForm = new BehaviorSubject<any>({});

  get monthNames(): string[] {
    return Object.keys(this.monthsEnum);
  }

  get daysInMonth() {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(this.year, this.zeroIndexedMonth + 1, 0).getDate();
  }

  get daysInMonthArray() {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    const days: number[] = [];
    for (let i = 1; i <= (this.daysInMonth); i++) days.push(i);
    return days;
  }

  year: number;
  zeroIndexedMonth: number;
  week: number;
  today: {};
  monthName: string;

  records: [] = [];
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

  get weekdayNames(): string[] {
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

  constructor(private calendarRepo: CalendarRepo) {
    let date = new Date();
    this.year = date.getFullYear();
    this.zeroIndexedMonth = date.getMonth();

    const firstOfMonth = new Date(this.year, this.zeroIndexedMonth, 1);
    this.week = Math.ceil((firstOfMonth.getDay() + date.getDate()) / 7);

    this.today = { 'year': this.year, 'month': this.zeroIndexedMonth, 'day': date.getDate() };

  }

  get weeksInMonth() {
    const firstOfMonth = new Date(this.year, this.zeroIndexedMonth, 1);
    const daysIntoWeek = firstOfMonth.getDay();
    return Math.ceil((daysIntoWeek + this.daysInMonth) / 7);
  }

  get calendarDaysInWeek() {
    let startDay;
    let endDay;
    let validDays = [];
    let emptyDays = [];

    const firstOfMonth = new Date(this.year, this.zeroIndexedMonth, 1);
    const daysIntoFirstWeek = firstOfMonth.getDay();
    let maxWeek = this.weeksInMonth;

    if (this.week === 1) {
      startDay = 0;
      endDay = (7 - daysIntoFirstWeek);
      validDays = this.daysInMonthArray.slice(startDay, endDay);

      let totalDaysInPreviousMonth = 7 - validDays.length;
      let col = 1;
      for (let daysIntoPreviousMonth = totalDaysInPreviousMonth - 1; daysIntoPreviousMonth >= 0; daysIntoPreviousMonth--) {
        const date = new Date(this.year, this.zeroIndexedMonth, -daysIntoPreviousMonth);
        emptyDays.push({'col': col++, 'name': this.weekdayNames[date.getDay()], 'dayInMonthArrayIndex': date.getDate() });
      }
    }
    else {
      const unajustedStartDay = (this.week - 1) * 7;
      startDay = unajustedStartDay - daysIntoFirstWeek;
      endDay = unajustedStartDay + (7 - daysIntoFirstWeek);
      validDays = this.daysInMonthArray.slice(startDay, endDay);

      if (this.week === maxWeek) {
        let totalDaysInNextMonth = 7 - validDays.length;
        let lastDayOfMonth = this.daysInMonthArray.slice(-1)[0];

        for (let daysIntoNextMonth = 1; daysIntoNextMonth <= totalDaysInNextMonth; daysIntoNextMonth++) {
          const date = new Date(this.year, this.zeroIndexedMonth, lastDayOfMonth + daysIntoNextMonth);
          emptyDays.push({'col': validDays.length + daysIntoNextMonth, 'name': this.weekdayNames[date.getDay()], 'dayInMonthArrayIndex': date.getDate() });
        }
      }
    }
    return { 'valid': validDays, 'empty': emptyDays };
  }

  getDayName(dayNumber) {
    return Object.keys(this.daysEnum)[dayNumber];
  }

  getRecordsByDay(day) {
    const records = this.records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

  getDayNameLongForMonth(day) {
    const date = new Date(this.year, this.zeroIndexedMonth, day);
    return this.getDayNameLong(date.getDay());
  }

  getDayNameLong(dayNumber) {
    return Object.keys(this.daysLongEnum)[dayNumber];
  }

  changeWeek(nextOrPrevious) {
    let maxWeek = this.weeksInMonth;
    if (nextOrPrevious === 'next')
      if (++this.week > maxWeek) this.changeMonth('next');
    if (nextOrPrevious === 'previous')
      if (--this.week < 1) this.changeMonth('previous');
  }

  changeMonth(nextOrPrevious) {
    let zeroIndexedMonth = this.zeroIndexedMonth;
    let oneIndexedMonth = this.zeroIndexedMonth + 1;

    let tempDate = new Date(`${this.year} ${oneIndexedMonth}`);

    if (nextOrPrevious === 'next') {
      tempDate.setMonth(zeroIndexedMonth + 1);
      this.year = tempDate.getFullYear();
      this.zeroIndexedMonth = tempDate.getMonth();
      this.week = 1;
    }
    else if (nextOrPrevious === 'previous') {
      tempDate.setMonth(zeroIndexedMonth - 1);
      this.year = tempDate.getFullYear();
      this.zeroIndexedMonth = tempDate.getMonth();
      this.week = this.weeksInMonth;
    }

    this.calendarRepo.calendarRecords.next({});
    this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);

    this.closeAddOrUpdateEventForm.next(true);
  }

  private compareByTime(a, b) {
    const is_hour_a_before_b = a.hour < b.hour ? true : (a.hour === b.hour ? null : false);
    const is_minute_a_before_b = a.minute < b.minute ? true : (a.minute === b.minute ? null : false);

    const is_a_before_b = is_hour_a_before_b || (is_hour_a_before_b === null && is_minute_a_before_b);
    const is_a_same_as_b = is_hour_a_before_b === null && is_minute_a_before_b === null;

    return is_a_before_b ? -1 : (is_a_same_as_b ? 1 : 0);
  }

  public padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

}
