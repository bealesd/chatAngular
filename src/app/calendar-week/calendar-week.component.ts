import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoginHelper } from '../helpers/login-helper';
import { CalendarRepo } from './../services/calendar.repo';
import { MenuService } from '../services/menu.service';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.css']
})
export class CalendarWeekComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  lastGridRow: number;
  penultimateGridRow: number;

  get dayDataForWeek() {
    const dayData = { 'empty': [], 'valid': [] };
    this.calendarService.calendarDaysInWeek.valid.forEach((dayNumber) => {
      const day = new Date(this.calendarService.year, this.calendarService.zeroIndexedMonth, dayNumber).getDay();

      const col = (day % 7);
      const dayName = this.calendarService.weekdayNames[col];

      dayData.valid.push({ 'gridCol': col + 1, 'name': dayName, 'dayInMonthArrayIndex': dayNumber });
    });

    this.calendarService.calendarDaysInWeek.empty.forEach((dayInfo) => {
      dayData.empty.push({ 'gridCol': dayInfo.col, 'name': dayInfo.name, 'dayInMonthArrayIndex': dayInfo.dayInMonthArrayIndex });
    });
    console.log(dayData)
    return dayData;
  }

  get dateTimeRecords() {
    let c = [];
    let validDays = this.dayDataForWeek.valid;
    for (const validDay of validDays) {
      for (const groupedRecord of this.getCalendardRecordHourGroupsByDay(validDay.dayInMonthArrayIndex)) {
        let a = {
          'hour': groupedRecord.hour,
          'day': validDay.dayInMonthArrayIndex,
          'records': groupedRecord.records,
          'col': validDay.gridCol
        }
        c.push(a);
      }
    }
    return c;

    //{hour: 17, day: 22, records: [], col}
  }

  get hoursOfDay() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i)
    }
    return hours;
  }

  hourToInt(hour) {
    return parseInt(hour);
  }

  getCalendardRecordHourGroupsByDay(calendarDay) {
    const records = this.calendarService.getRecordsByDay(calendarDay);

    records.forEach((record: any) => record.hour = this.calendarService.padToTwo(record.hour));

    let grouped = this.groupBy(records, 'hour');

    let b = [];
    for (let i = 0; i < Object.keys(grouped).length; i++) {
      const hour = Object.keys(grouped)[i];
      b.push({
        'hour': hour,
        'records': grouped[hour]
      });
    }
    //[{'hour': 4, 'records': []}]
    return b;
  }

  groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  constructor(
    private calendarRepo: CalendarRepo,
    private loginHelper: LoginHelper,
    private menuService: MenuService,
    public calendarService: CalendarService
  ) { }

  ngOnInit() {
    this.menuService.disableMenuItem('undo-click');

    if (!this.loginHelper.checkPersonSelected()) this.loginHelper.setPerson();

    this.calendarRepo.calendarRecords.subscribe(calendarRecords => {
      if (calendarRecords.hasOwnProperty(`${this.calendarService.year}-${this.calendarService.zeroIndexedMonth}`))
        this.calendarService.records = calendarRecords[`${this.calendarService.year}-${this.calendarService.zeroIndexedMonth}`].records;
      else
        this.calendarService.records = [];
    });

    this.calendarRepo.getCalendarRecords(this.calendarService.year, this.calendarService.zeroIndexedMonth);
  }

  ngOnDestroy() {
    this.calendarRepo.calendarRecords.observers.forEach(element => { element.complete(); });
    this.calendarRepo.calendarRecords.next({});

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
