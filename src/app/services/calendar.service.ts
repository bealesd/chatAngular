import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

import { CalendarRepo } from './calendar.repo'
import { CalendarRecordRest } from '../models/calendar-record-rest.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnDestroy {
  public subscriptions: Subscription[] = [];

  public calendarRecords = new BehaviorSubject<any>({});

  public closeAddOrUpdateEventForm = new BehaviorSubject<boolean>(true);
  public openUpdateEventForm = new BehaviorSubject<any>({});
  public openAddEventForm = new BehaviorSubject<any>({});

  get years() {

    const years: number[] = [];
    for (let i = this.today.year - 5; i <= this.today.year + 10; i++) years.push(i);
    return years;
  }

  get monthNames(): string[] {
    return Object.keys(this.monthsEnum);
  }

  get monthNamesShort(): string[] {
    return Object.keys(this.monthsShortEnum);
  }

  get daysInMonth(): number {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(this.year, this.zeroIndexedMonth + 1, 0).getDate();
  }

  get daysInMonthArray(): number[] {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    const days: number[] = [];
    for (let i = 1; i <= (this.daysInMonth); i++) days.push(i);
    return days;
  }

  year: number;
  
  _zeroIndexedMonth: number;
  get zeroIndexedMonth() { return this._zeroIndexedMonth; }
  set zeroIndexedMonth(value: number) {
    if (isNaN(value)) console.error('zeroIndexedMonth is not a number.');
    else this._zeroIndexedMonth = parseInt(`${value}`);
  }

  public week = new BehaviorSubject<number>(1);
  day: number;
  today: { year: number; month: number; week: number; day: number; };
  monthName: string;

  records: CalendarRecordRest = new CalendarRecordRest();
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

  constructor(private calendarRepo: CalendarRepo) {
    let date = new Date();
    this.year = date.getFullYear();
    this.zeroIndexedMonth = date.getMonth();

    const firstOfMonth = new Date(this.year, this.zeroIndexedMonth, 1);
    this.week.next(Math.ceil((firstOfMonth.getDay() + date.getDate()) / 7));
    this.day = date.getDate();

    this.today = { 'year': this.year, 'month': this.zeroIndexedMonth, 'week': this.week.getValue(), 'day': this.day };

    this.records.month = this.zeroIndexedMonth;
    this.records.year = this.year;

    this.subscriptions.push(interval(1000 * 60 * 5).subscribe(() => {
      this.today = { 'year': this.year, 'month': this.zeroIndexedMonth, 'week': this.week.getValue(), 'day': this.day };
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => { subscription.unsubscribe(); });
    this.subscriptions = [];
  }

  get weeksInMonth(): number {
    const firstOfMonth: Date = new Date(this.year, this.zeroIndexedMonth, 1);
    const daysIntoWeek: number = firstOfMonth.getDay();
    return Math.ceil((daysIntoWeek + this.daysInMonth) / 7);
  }

  get calendarDaysInWeek() {
    let startDay: number;
    let endDay: number;
    let validDays: number[] = [];
    let emptyDays = [];

    const firstOfMonth = new Date(this.year, this.zeroIndexedMonth, 1);
    const daysIntoFirstWeek = firstOfMonth.getDay();
    let maxWeek: number = this.weeksInMonth;

    if (this.week.getValue() === 1) {
      startDay = 0;
      endDay = (7 - daysIntoFirstWeek);
      validDays = this.daysInMonthArray.slice(startDay, endDay);

      let totalDaysInPreviousMonth: number = 7 - validDays.length;
      let col: number = 1;
      for (let daysIntoPreviousMonth = totalDaysInPreviousMonth - 1; daysIntoPreviousMonth >= 0; daysIntoPreviousMonth--) {
        const date = new Date(this.year, this.zeroIndexedMonth, -daysIntoPreviousMonth);
        emptyDays.push({ 'col': col++, 'name': this.weekdayNames[date.getDay()], 'dayInMonthArrayIndex': date.getDate() });
      }
    }
    else {
      const unajustedStartDay: number = (this.week.getValue() - 1) * 7;
      startDay = unajustedStartDay - daysIntoFirstWeek;
      endDay = unajustedStartDay + (7 - daysIntoFirstWeek);
      validDays = this.daysInMonthArray.slice(startDay, endDay);

      if (this.week.getValue() === maxWeek) {
        let totalDaysInNextMonth: number = 7 - validDays.length;
        let lastDayOfMonth: number = this.daysInMonthArray.slice(-1)[0];

        for (let daysIntoNextMonth = 1; daysIntoNextMonth <= totalDaysInNextMonth; daysIntoNextMonth++) {
          const date = new Date(this.year, this.zeroIndexedMonth, lastDayOfMonth + daysIntoNextMonth);
          emptyDays.push({ 'col': validDays.length + daysIntoNextMonth, 'name': this.weekdayNames[date.getDay()], 'dayInMonthArrayIndex': date.getDate() });
        }
      }
    }
    return { valid: validDays, empty: emptyDays };
  }

  getDayName(dayNumber: number): string {
    return Object.keys(this.daysEnum)[dayNumber];
  }

  getDayNameShortForMonth(day: number): string {
    const date = new Date(this.year, this.zeroIndexedMonth, day);
    return this.getDayName(date.getDay());
  }

  getDayNameLongForMonth(day: number): string {
    const date = new Date(this.year, this.zeroIndexedMonth, day);
    return this.getDayNameLong(date.getDay());
  }

  getDayNameLong(dayNumber: number): string {
    return Object.keys(this.daysLongEnum)[dayNumber];
  }

  changeDay(nextOrPrevious: string) {
    let maxDay = this.daysInMonthArray[this.daysInMonthArray.length - 1];
    if (nextOrPrevious === 'next') {
      if (++this.day > maxDay)
        this.changeMonth('next');
    }
    else if (nextOrPrevious === 'previous') {
      if (--this.day < 1)
        this.changeMonth('previous');
    }
  }

  changeWeek(nextOrPrevious: string) {
    let maxWeek = this.weeksInMonth;
    let week = parseInt(`${this.week.getValue()}`);
    if (nextOrPrevious === 'next') {
      this.week.next(++week);
      if (week > maxWeek)
        this.changeMonth('next');
    }
    else if (nextOrPrevious === 'previous') {
      this.week.next(--week);
      if (week < 1)
        this.changeMonth('previous');
    }
  }

  changeMonth(nextOrPrevious: string) {
    const oneIndexedMonth =  this.zeroIndexedMonth + 1;
    let tempDate = new Date(`${this.year} ${oneIndexedMonth}`);

    if (nextOrPrevious === 'next') {
      tempDate.setMonth(this.zeroIndexedMonth + 1);
      this.year = tempDate.getFullYear();
      this.zeroIndexedMonth = tempDate.getMonth();
      this.week.next(1);
      this.day = 1;
    }
    else if (nextOrPrevious === 'previous') {
      tempDate.setMonth(this.zeroIndexedMonth - 1);
      this.year = tempDate.getFullYear();
      this.zeroIndexedMonth = tempDate.getMonth();
      this.week.next(this.weeksInMonth);
      this.day = this.daysInMonth;
    }

    this.calendarRepo.calendarRecordRest.next(new CalendarRecordRest());
    this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);

    this.closeAddOrUpdateEventForm.next(true);
  }

  updateRecords() {
    this.calendarRepo.calendarRecordRest.next(new CalendarRecordRest());
    this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);
    this.day = 1;
    this.closeAddOrUpdateEventForm.next(true);
  }

  changeToToday() {
    this.year = this.today.year;
    this.zeroIndexedMonth = this.today.month;
    this.week.next(this.today.week);
    this.day = this.today.day;
    this.calendarRepo.calendarRecordRest.next(new CalendarRecordRest());
    this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);
  }

  subscribeToCalendarRecords() {
    this.calendarRepo.calendarRecordRest.subscribe(calendarRecords => {
      this.records = calendarRecords;
    });
  }

  removeSubscriptions() {
    this.calendarRepo.calendarRecordRest.observers.forEach(element => { element.complete(); });
    this.calendarRepo.calendarRecordRest.next(new CalendarRecordRest());
  }

  resetSubsciptions() {
    this.removeSubscriptions();
    this.subscribeToCalendarRecords();
    this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);
  }

  public addOridnalIndictor(day: number): string {
    const j = day % 10;
    const k = day % 100;
    let oridnalIndictor;
    if (j == 1 && k != 11)
      oridnalIndictor = "st";
    else if (j == 2 && k != 12)
      oridnalIndictor = "nd";
    else if (j == 3 && k != 13)
      oridnalIndictor = "rd";
    else
      oridnalIndictor = "th";
    return oridnalIndictor;
  }
}
