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
  week: number;

  constructor(private calendarRepo: CalendarRepo) {
    let date = new Date();
    this.year = date.getFullYear();
    this.zeroIndexedMonth = date.getMonth();

    const firstOfMonth = new Date(this.year, this.zeroIndexedMonth, 1);
    this.week = Math.ceil((firstOfMonth.getDay() + date.getDate()) / 7);

    this.today = { 'year': this.year, 'month': this.zeroIndexedMonth, 'day': date.getDate() };

  }

  changeWeek(incrementWeekOrMonth) {
    //need to change month and year possibly
    let maxWeek = this.weeksInMonth;
    if (incrementWeekOrMonth) {
      this.week += 1;
      if (this.week > maxWeek) {
        this.changeMonth(true);
      }
    }
    else {
      this.week -= 1;
      if (this.week < 1) {
        this.changeMonth(false);
        this.week = this.weeksInMonth;
      }
    }

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
    const daysIntoWeek = firstOfMonth.getDay();

    if (this.week === 1) {
      startDay = 0;
      endDay = (7 - daysIntoWeek);

      validDays = this.daysInMonthArray.slice(startDay, endDay);
      let col = 1;
      for (let i = (7 - validDays.length)-1; i >= 0 ; i--) {
        // rename i to days-before-current-month
        const date = new Date(this.year, this.zeroIndexedMonth, -i);
        emptyDays.push({'date': date, 'col': col++});
      }
    }
    else {
      startDay = ((this.week - 1) * 7 + (7 - daysIntoWeek)) - 7;
      endDay = ((this.week - 1) * 7 + (7 - daysIntoWeek));

      validDays = this.daysInMonthArray.slice(startDay, endDay);
      let col = 7;
      for (let i = (7 - validDays.length)-1; i >= 0 ; i--) {
        const date = new Date(this.year, this.zeroIndexedMonth, (this.daysInMonthArray.length-1);
        emptyDays.push({'date': date, 'col': col--});
      }
      // emptyDays = (new Array(7-validDays.length)).fill(0)

      // let emptyDaysEndDay = (startDay + 7) > (this.daysInMonthArray.length - 1) ? (this.daysInMonthArray.length - 1):(startDay + 7)
      // emptyDays = this.daysInMonthArray.slice(endDay, emptyDaysEndDay);
    }

    return { 'valid': validDays, 'empty': emptyDays };
  }

  // TODO - going to be used to manage all calendar data, and will be used by calendar month and calendar week components.

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

  today: {};

  monthName: string;

  records: [] = [];

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

  changeMonth(isNextMonth: boolean) {
    let zeroIndexedMonth = this.zeroIndexedMonth;
    let oneIndexedMonth = this.zeroIndexedMonth + 1;

    let year = this.year;

    let tempDate = new Date(`${year} ${oneIndexedMonth}`);

    if (isNextMonth) {
      tempDate.setMonth(zeroIndexedMonth + 1);
      this.week = 1;
    }
    else {
      tempDate.setMonth(zeroIndexedMonth - 1);
      this.week = 1;
    }

    this.year = tempDate.getFullYear();
    this.zeroIndexedMonth = tempDate.getMonth();

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

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

}
