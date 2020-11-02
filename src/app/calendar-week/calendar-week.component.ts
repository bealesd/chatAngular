import { Component, OnInit, OnDestroy } from '@angular/core';

import { LoginHelper } from '../helpers/login-helper';
import { MenuService } from '../services/menu.service';
import { CalendarService } from '../services/calendar.service';
import { CalendarRecord } from '../models/calendar-record.model';

@Component({
  selector: 'app-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.css'],
  template: `<input [(ngModel)]="prop">`
})
export class CalendarWeekComponent implements OnInit, OnDestroy {
  get dayDataForWeek() {
    const dayData = { 'invalid': [], 'valid': [] };

    const week  = this.calendarService.week.getValue();
    this.calendarService.records.getDayRangeForWeek(week).forEach((dayNumber) => {
      const day = new Date(this.calendarService.year, this.calendarService.zeroIndexedMonth, dayNumber).getDay();
      const col = (day % 7);
      const dayName = this.calendarService.weekdayNames[col];

      dayData.valid.push({ 'gridCol': col + 1, 'name': dayName, 'dayInMonthArrayIndex': dayNumber });
    });
    this.calendarService.records.getDaysForWeekOutsideOfMonth(week).forEach((dayInfo) => {
      const day = dayInfo.date.getDay();
      const col = (day % 7) + 1;
      const dayName = this.calendarService.weekdayNames[col];

      dayData.invalid.push({ 'gridCol': col, 'name': dayName, 'dayInMonthArrayIndex': dayInfo.dayInMonthArrayIndex });
    });

    return dayData;
  }

  get dateTimeRecords(): { hour: number; day: number; records: CalendarRecord[]; col: number; }[] {
    const allRecordsGroupedByHour: { hour: number, day: number, records: CalendarRecord[], col: number }[] = [];
    const validDays = this.dayDataForWeek.valid;
    for (let validDay of validDays) {
      for (let groupedRecord of this.calendarService.records.getRecordsGroupedByHourForDay(validDay.dayInMonthArrayIndex)) {
        const recordsGroupedByHour = {
          'hour': groupedRecord.hour,
          'day': validDay.dayInMonthArrayIndex,
          'records': groupedRecord.records,
          'col': validDay.gridCol
        }
        allRecordsGroupedByHour.push(recordsGroupedByHour);
      }
    }
    return allRecordsGroupedByHour;
  }

  get dateTimeEmptyRecords(): { hour: number, day: number, col: number }[] {
    const emptyHoursData: { hour: number, day: number, col: number }[] = [];
    const validDays = this.dayDataForWeek.valid;
    for (let validDay of validDays) {
      for (let emptyHour of this.calendarService.records.getEmptyHoursByDay(validDay.dayInMonthArrayIndex)) {
        const empytHourData = {
          hour: parseInt(emptyHour.value),
          day: validDay.dayInMonthArrayIndex,
          col: validDay.gridCol
        }
        emptyHoursData.push(empytHourData);
      }
    }
    return emptyHoursData;
  }

  get dateTimeInvalidEmptyRecords() {
    const emptyHoursData = [];
    const invalidDays = this.dayDataForWeek.invalid;
    for (let validDay of invalidDays) {
      for (let emptyHour of this.calendarService.records.hoursOfDay) {
        const empytHourData = {
          'hour': emptyHour.value,
          'day': validDay.dayInMonthArrayIndex,
          'col': validDay.gridCol
        }
        emptyHoursData.push(empytHourData);
      }
    }
    return emptyHoursData;
  }

  constructor(
    private loginHelper: LoginHelper,
    private menuService: MenuService,
    public calendarService: CalendarService
  ) { }

  ngOnInit() {
    this.menuService.disableMenuItem('undo-click');

    if (!this.loginHelper.checkPersonSelected()) this.loginHelper.setPerson();

    this.calendarService.resetSubsciptions();
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
