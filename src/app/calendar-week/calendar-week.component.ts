import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalendarService } from '../services/calendar.service';
import { CalendarRecord } from '../models/calendar-record.model';
import { CalendarHelper } from '../helpers/calendar-helper';

@Component({
  selector: 'app-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.css'],
  template: `<input [(ngModel)]="prop">`
})
export class CalendarWeekComponent implements OnInit, OnDestroy {

  get daysForWeek(): { col: number, name: string, dayInMonthArrayIndex: number }[] {
    return this.transformDaysForWeek(this.calendarService.getDaysForWeek());
  }

  get emptyDaysForWeek(): { col: number, name: string, dayInMonthArrayIndex: number }[] {
    return this.transformDaysForWeek(this.calendarService.getDaysForWeekOutsideOfMonth());
  }

  get dateTimeRecords(): { hour: number; day: number; col: number; records: CalendarRecord[]; }[] {
    return this.calendarService.getRecordsGroupedByHourAndDayForWeek()
      .map(rec => Object({ hour: rec.hour, day: rec.date.getDate(), col: (rec.date.getDay() % 7) + 1, records: rec.records }));
  }

  get dateTimeEmptyRecords(): { hour: number, day: number, col: number }[] {
    return this.calendarService.getEmptyRecordsGroupedByHourAndDayForWeek()
      .map(rec => Object({ hour: rec.hour, day: rec.date.getDate(), col: (rec.date.getDay() % 7) + 1 }));
  }

  get dateTimeInvalidEmptyRecords() {
    const emptyHoursData = [];
    for (let dayDate of this.calendarService.getDaysForWeekOutsideOfMonth()) {
      for (let emptyHour of this.calendarHelper.hoursOfDay())
        emptyHoursData.push({ hour: emptyHour.value, day: dayDate.getDay(), col: (dayDate.getDay() % 7) + 1 });
    }
    return emptyHoursData;
  }

  constructor(
    public calendarService: CalendarService,
    public calendarHelper: CalendarHelper
  ) { }

  ngOnInit() { }

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

  private transformDaysForWeek(days: Date[]): { col: number, name: string, dayInMonthArrayIndex: number }[] {
    return days.map((dayDate: Date) => {
      const col = dayDate.getDay() % 7;
      const dayName = this.calendarHelper.weekdayNames[col];
      return { col: col + 1, name: dayName, dayInMonthArrayIndex: dayDate.getDate() };
    });
  }
}
