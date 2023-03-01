import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalendarService } from '../services/calendar.service';
import { CalendarRecord } from '../models/calendar-record.model';
import { CalendarHelper } from '../helpers/calendar-helper';

import { getYear, getMonth, getDaysInMonth, getDate, format, getDay, startOfMonth, endOfMonth, eachDayOfInterval, getWeekOfMonth } from 'date-fns'
import { enGB } from 'date-fns/locale';

@Component({
  selector: 'app-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.css']
})
export class CalendarMonthComponent implements OnInit, OnDestroy {
  timeString(date: Date) {
    return format(date, 'HH:mm', { locale: enGB });
  }

  dayOfMonthString(date: Date) {
    return format(date, 'do', { locale: enGB });
  }

  get year(): number {
    return getYear(this.calendarService.currentDate);
  }
  get month(): number {
    return getMonth(this.calendarService.currentDate);
  }
  get day(): number {
    return getDate(this.calendarService.currentDate);
  }
  get todayYear(): number {
    return getYear(this.calendarService.today);
  }
  get todayMonth(): number {
    return getMonth(this.calendarService.today);
  }
  get todayDay(): number {
    return getDate(this.calendarService.today);
  }

  get dayDataForMonth() {
    const startOfCurrentMonth = startOfMonth(this.calendarService.currentDate);
    const endOfCurrentMonth = endOfMonth(this.calendarService.currentDate);
    const days = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });
    const dayData = [];
    for (const dayDate of days) {
      dayData.push({
        'gridRow': (getDay(dayDate) === 0 ? getWeekOfMonth(dayDate, { weekStartsOn: 0 }) -1 : getWeekOfMonth(dayDate, { weekStartsOn: 0 })),
        'gridCol': (getDay(dayDate) === 0 ? 7 : getDay(dayDate)),
        'dayInMonth': getDate(dayDate),
        'dateTime': dayDate
      });
    }
    return dayData;
  }

  constructor(
    public calendarService: CalendarService,
    public calendarHelper: CalendarHelper
  ) { }

  ngOnInit() {
    window['pageTitle'] = 'Calendar';
    window['toolInfo'] = '';
  }

  ngOnDestroy() {
    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'dayData': {}, 'open': false });
  }

  isToday(day) {
    return this.todayYear === this.year
      && this.todayMonth === this.month
      && this.todayDay === day
      ? 'today'
      : '';
  }

  openUpdateEventForm(record: CalendarRecord) {
    this.calendarService.openUpdateEventForm.next({ 'record': record, 'open': true });
  }

  openAddEventForm(dayData) {
    this.calendarService.openAddEventForm.next({ 'dayData': dayData, 'open': true });
  }

  getYear(date: Date) {
    return getYear(date);
  }

  getMonth(date: Date) {
    return getMonth(date)
  }

  getDayInMonth(date: Date) {
    return getDaysInMonth(date)
  }
}
