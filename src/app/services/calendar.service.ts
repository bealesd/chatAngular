import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

import { CalendarRepo } from './calendar.repo'
import { CalendarRecordRest } from '../models/calendar-record-rest.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnDestroy {
  public subscriptions: Subscription[] = [];

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

  public week = 1;
  day: number;
  today: { year: number; month: number; week: number; day: number; };
  monthName: string;

  records: CalendarRecordRest;
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
    this.records = this.calendarRepo.calendarRecordRest;

    const date = new Date();
    this.year = date.getFullYear();
    this.zeroIndexedMonth = date.getMonth();

    const firstOfMonth = new Date(this.year, this.zeroIndexedMonth, 1);
    this.week = Math.ceil((firstOfMonth.getDay() + date.getDate()) / 7);
    this.day = date.getDate();

    this.records.month = this.zeroIndexedMonth;
    this.records.year = this.year;

    this.setTodaysDate();
    this.subscriptions.push(interval(1000 * 60 * 5).subscribe(() => this.setTodaysDate()));
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

  setTodaysDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const week = Math.ceil((firstOfMonth.getDay() + date.getDate()) / 7);
    const day = date.getDate();
    this.today = { 'year': year, 'month': month, 'week': week, 'day': day };
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
    const maxDay = this.daysInMonthArray[this.daysInMonthArray.length - 1];
    if (nextOrPrevious === 'next' && ++this.day > maxDay) this.changeMonth('next');
    else if (nextOrPrevious === 'previous' && --this.day < 1) this.changeMonth('previous')
  }

  changeWeek(nextOrPrevious: string) {
    const maxWeek = this.weeksInMonth;
    if (nextOrPrevious === 'next' && ++this.week > maxWeek) this.changeMonth('next');
    else if (nextOrPrevious === 'previous' && --this.week < 1) this.changeMonth('previous');
  }

  async changeMonth(nextOrPrevious: string) {
    const oneIndexedMonth = this.zeroIndexedMonth + 1;
    let tempDate = new Date(`${this.year} ${oneIndexedMonth}`);

    if (nextOrPrevious === 'next') {
      tempDate.setMonth(this.zeroIndexedMonth + 1);
      this.year = tempDate.getFullYear();
      this.zeroIndexedMonth = tempDate.getMonth();
      this.week = 1;
      this.day = 1;
    }
    else if (nextOrPrevious === 'previous') {
      tempDate.setMonth(this.zeroIndexedMonth - 1);
      this.year = tempDate.getFullYear();
      this.zeroIndexedMonth = tempDate.getMonth();
      this.week = this.weeksInMonth;
      this.day = this.daysInMonth;
    }

    await this.calendarRepo.getAllRecords();
    
    await this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);

    this.closeAddOrUpdateEventForm.next(true);
  }

  async updateRecords() {
    await this.calendarRepo.getAllRecords();

    this.calendarRepo.calendarRecordRest.records = [];
    await this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);
    this.day = 1;
    this.closeAddOrUpdateEventForm.next(true);
  }

  async changeToToday() {
    this.year = this.today.year;
    this.zeroIndexedMonth = this.today.month;
    this.week = this.today.week;
    this.day = this.today.day;
    await this.calendarRepo.getCalendarRecords(this.year, this.zeroIndexedMonth);
  }

  public addOrdinalIndictor(day: number): string {
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
