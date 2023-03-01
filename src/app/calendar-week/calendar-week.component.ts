import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalendarService } from '../services/calendar.service';
import { CalendarRecord } from '../models/calendar-record.model';
import { CalendarHelper } from '../helpers/calendar-helper';

import {
  getMonth, getDay, getDate, startOfWeek, endOfWeek,
  getHours, eachDayOfInterval, eachHourOfInterval, format
} from 'date-fns'

@Component({
  selector: 'app-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.css'],
  template: `<input [(ngModel)]="prop">`
})
export class CalendarWeekComponent implements OnInit, OnDestroy {

  get daysForWeek(): { col: number, dayName: string, dayInMonth: number }[] {
    // Get start and end of current week
    const startOfCurrentWeek = startOfWeek(this.calendarService.currentDate);
    const endOfCurrentWeek = endOfWeek(this.calendarService.currentDate);

    // Get array of dates for current week
    const currentWeekDates = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

    // Filter dates that are in current month
    const dayDatesInCurrentWeekAndMonth = currentWeekDates.filter(date => date.getMonth() === getMonth(this.calendarService.currentDate));

    const transformedDays = dayDatesInCurrentWeekAndMonth.map((day) => {
      const col = getDay(day);
      const dayName = format(day, 'EEEEEE');
      const dayInMonth = getDate(day);
      return { col: col + 1, dayName: dayName, dayInMonth: dayInMonth };
    })
    return transformedDays;
  }

  get emptyDaysForWeek(): { col: number, dayName: string, dayInMonth: number }[] {
    // Get start and end of current week
    const startOfCurrentWeek = startOfWeek(this.calendarService.currentDate);
    const endOfCurrentWeek = endOfWeek(this.calendarService.currentDate);

    // Get array of dates for current week
    const currentWeekDates = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

    // Filter dates that are outisde of current month
    const dayDatesNotInCurrentWeekAndMonth = currentWeekDates.filter(date => getMonth(date) !== getMonth(this.calendarService.currentDate));

    const transformedDays = dayDatesNotInCurrentWeekAndMonth.map((day) => {
      const col = getDay(day);
      const dayName = format(day, 'EEEEEE');
      const dayInMonth = getDate(day);
      return { col: col + 1, dayName: dayName, dayInMonth: dayInMonth };
    })
    return transformedDays;
  }

  get dateTimeRecords(): { hour: number; day: number; col: number; records: CalendarRecord[]; }[] {
    const recordsByHour = [];
    for (const record of this.calendarService.calendarRecords) {
      const hourAndDayObj = recordsByHour.find((obj) => obj.day === getDate(record.dateTime) && obj.hour === getHours(record.dateTime));
      if (hourAndDayObj) 
        hourAndDayObj.records.push(record);
      else 
        recordsByHour.push({ hour: getHours(record.dateTime), col: (getDay(record.dateTime) + 1), day: getDate(record.dateTime), records: [record] });
    }
    return recordsByHour;
  }
  get dateTimeEmptyRecords(): { day: number, hour: number, col: number }[] {
    const startOfCurrentWeek = startOfWeek(this.calendarService.currentDate);
    const endOfCurrentWeek = endOfWeek(this.calendarService.currentDate);

    // Get every hour of the week
    const currentHourDates = eachHourOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });
    const activeHourDates = currentHourDates.filter(date => getMonth(date) === getMonth(this.calendarService.currentDate));

    const emptyRecordsByHour = [];
    for (const hourDate of activeHourDates) {
      // find an hour that does not have a record in it and add it to the empty hours array
      if (this.calendarService.calendarRecords.findIndex(a => getDate(a.dateTime) === getDate(hourDate) && getHours(a.dateTime) === getHours(hourDate)) !== -1)
        continue;
      emptyRecordsByHour.push({ hour: getHours(hourDate), col: (getDay(hourDate) + 1), day: getDate(hourDate) });
    }
    return emptyRecordsByHour;
  }

  get dateTimeInvalidEmptyRecords(): { day: number, hour: number, col: number }[] {
    const startOfCurrentWeek = startOfWeek(this.calendarService.currentDate);
    const endOfCurrentWeek = endOfWeek(this.calendarService.currentDate);

    // Get every hour of the week
    const currentHourDates = eachHourOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });
    const activeHourDates = currentHourDates.filter(date => getMonth(date) !== getMonth(this.calendarService.currentDate));

    const emptyRecordsByHour = [];
    for (const hourDate of activeHourDates) {
      // find an hour that does not have a record in it and add it to the empty hours array
      emptyRecordsByHour.push({ hour: getHours(hourDate), col: (getDay(hourDate) + 1), day: getDate(hourDate) });
    }
    return emptyRecordsByHour;
  }

  constructor(
    public calendarService: CalendarService,
    public calendarHelper: CalendarHelper
  ) { }

  ngOnInit() { }

  ngAfterViewInit() {
    // scroll to current time
    const currentHour = new Date().getHours();
    const hourElement = document.querySelectorAll(".date-box")[currentHour];
    const yPositionOfHourElement = Math.abs(hourElement.getBoundingClientRect().y);
    window.scrollTo(0, yPositionOfHourElement + (window.innerHeight - 100) / 2);
  }

  ngOnDestroy() {
    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'dayData': {}, 'open': false });
  }

  openUpdateEventForm(record) {
    this.calendarService.openUpdateEventForm.next({ 'record': record, 'open': true });
  }

  openAddEventForm(dayData) {
    this.calendarService.openAddEventForm.next({ 'dayData': dayData, 'open': true });
  }
}
