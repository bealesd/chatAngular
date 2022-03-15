import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalendarService } from '../services/calendar.service';
import { CalendarRecord } from '../models/calendar-record.model';
import { CalendarHelper } from '../helpers/calendar-helper';

@Component({
  selector: 'app-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.css']
})
export class CalendarMonthComponent implements OnInit, OnDestroy {
  get dayDataForMonth() {
    const dayData = [];
    let gridRow = 0;
    for (const dayNumber of this.calendarHelper.daysInMonthArray(this.calendarService.year, this.calendarService.month)) {
      const day = new Date(this.calendarService.year, this.calendarService.month, dayNumber).getDay();
      if (day === 1 || dayNumber === 1) gridRow++;
      const gridCol = day === 0 ? 7 : day % 7;
      dayData.push({ 'gridRow': gridRow, 'gridCol': gridCol, 'dayInMonthArrayIndex': dayNumber });
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

  openUpdateEventForm(record: CalendarRecord) {
    this.calendarService.openUpdateEventForm.next({ 'record': record, 'open': true });
  }

  openAddEventForm(dayData) {
    this.calendarService.openAddEventForm.next({ 'dayData': dayData, 'open': true });
  }
}
