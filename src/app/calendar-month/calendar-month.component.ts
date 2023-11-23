import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalendarService } from '../services/calendar.service';
import { CalendarRecord } from '../models/calendar-record.model';

import { startOfWeek, setHours, getYear, getMonth, getDaysInMonth, getDate, format, getDay, startOfMonth, endOfMonth, eachDayOfInterval, getWeekOfMonth, addDays, compareAsc } from 'date-fns'
import { enGB } from 'date-fns/locale';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.css']
})
export class CalendarMonthComponent implements OnInit, OnDestroy {
  records: CalendarRecord[] = [];
  currentDate: Date = null;
  todaysDate: Date = null;

  get year(): number {
    return getYear(this.currentDate);
  }
  get month(): number {
    return getMonth(this.currentDate);
  }
  get todayYear(): number {
    return getYear(this.todaysDate);
  }
  get todayMonth(): number {
    return getMonth(this.todaysDate);
  }
  get todayDay(): number {
    return getDate(this.todaysDate);
  }
  get weekdayNamesEndSunday() {
    const dateMonday = startOfWeek(new Date, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: dateMonday, end: addDays(dateMonday, 6) }).map(day => format(day, 'eee'));
    return daysOfWeek;
  }
  get dayDatesForMonth() {
    const startOfCurrentMonth = startOfMonth(this.currentDate);
    const endOfCurrentMonth = endOfMonth(this.currentDate);
    const days = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });
    const dayDates = [];
    for (const dayDate of days) {
      const dayNumber = getDay(dayDate);

      // Sunday is in the 7th column in the UI, but is classed as the first day of week so subsequent days are moved to next row.
      // the +1 and +2 are cause by grid row being 1 indexed.
      const isSunday = dayNumber === 0;
      const gridRowForSunday = getWeekOfMonth(dayDate, { weekStartsOn: 0 }) + 1;

      const gridRow = getWeekOfMonth(dayDate, { weekStartsOn: 0 }) + 2;
      const row = (isSunday ? gridRowForSunday : gridRow);
      const col = (getDay(dayDate) === 0 ? 7 : getDay(dayDate));
      dayDates.push({
        'gridRow': row,
        'gridCol': col,
        'DateTime': dayDate
      });
    }
    return dayDates;
  }

  constructor(
    public calendarService: CalendarService
  ) { }

  subscriptions: Subscription[] = [];

  ngOnInit() {
    window['pageTitle'] = 'Calendar';
    window['toolInfo'] = '';

    this.subscriptions.push(this.calendarService.calendarRecordsSubject.subscribe((records: CalendarRecord[]) => {
      this.records = records;
    }));
    this.subscriptions.push(this.calendarService.currentDateSubject.subscribe((currentDate: Date) => {
      this.currentDate = currentDate;
    }));
    this.subscriptions.push(this.calendarService.todayDateSubject.subscribe((todaysDate: Date) => {
      this.todaysDate = todaysDate;
    }));
  }

  ngOnDestroy() {
    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'date': {}, 'open': false });

    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  isToday(day: Date) {
    return this.todayYear === this.year
      && this.todayMonth === this.month
      && this.todayDay === getDate(day)
      ? 'today'
      : '';
  }

  openUpdateEventForm(record: CalendarRecord) {
    this.calendarService.openUpdateEventForm.next({ 'record': record, 'open': true });
  }

  openAddEventForm(date) {
    date = setHours(date, 12);
    this.calendarService.openAddEventForm.next({ 'date': date, 'open': true });
  }

  getYear(date: Date) {
    return getYear(date);
  }

  getMonth(date: Date) {
    return getMonth(date);
  }

  getDayInMonth(date: Date) {
    return getDaysInMonth(date);
  }

  filterRecordsByDay(dayInMonth: Date) {
    let records = this.records.filter(record => getDate(record.DateTime) === getDate(dayInMonth));
    records.sort((a, b) => compareAsc(a.DateTime, b.DateTime));
    return records;
  }

  timeString(date: Date) {
    const timeString = format(date, 'HH:mm', { locale: enGB });
    return timeString;
  }

  dayOfMonthString(date: Date) {
    const dayOfMonthString = format(date, 'do', { locale: enGB });
    return dayOfMonthString;
  }
}
