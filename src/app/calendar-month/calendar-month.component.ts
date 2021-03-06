import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalendarService } from '../services/calendar.service';
import { CalendarRecord } from '../models/calendar-record.model';

@Component({
  selector: 'app-calendar-month',
  templateUrl: './calendar-month.component.html',
  styleUrls: ['./calendar-month.component.css']
})
export class CalendarMonthComponent implements OnInit, OnDestroy {
  lastGridRow: number;
  penultimateGridRow: number;
  lastCol: number;

  get dayDataForMonth() {
    const dayData = [];

    let gridRow = 1;
    this.calendarService.daysInMonthArray.forEach((dayNumber, index) => {
      const day = new Date(this.calendarService.year, this.calendarService.zeroIndexedMonth, dayNumber).getDay();
      if (index !== 0 && day === 0) gridRow++;

      const col = (day % 7);
      const dayName = this.calendarService.weekdayNames[col];
      const gridCol = col + 1;
      this.lastCol = gridCol;

      dayData.push({ 'gridRow': gridRow, 'gridCol': gridCol, 'name': dayName, 'dayInMonthArrayIndex': dayNumber });
    });

    this.lastGridRow = gridRow;
    this.penultimateGridRow = gridRow - 1;

    return dayData;
  }

  constructor(
    public calendarService: CalendarService
  ) { }

  ngOnInit() { }

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
