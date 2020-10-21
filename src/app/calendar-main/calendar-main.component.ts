import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoginHelper } from '../helpers/login-helper';
import { CalendarRepo } from './../services/calendar.repo';
import { MenuService } from '../services/menu.service';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-main',
  templateUrl: './calendar-main.component.html',
  styleUrls: ['./calendar-main.component.css']
})
export class CalendarMainComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  lastGridRow: number;
  penultimateGridRow: number;
  lastCol: number;

  openUpdateEventForm(record) {
    this.calendarService.openUpdateEventForm.next({ 'record': record, 'open': true });
  }

  openAddEventForm(dayData) {
    this.calendarService.openAddEventForm.next({ 'dayData': dayData, 'open': true });
  }

  get dayDataForMonth() {
    const dayData = [];

    let gridRow = 1;
    this.calendarService.daysInMonthArray.forEach((dayNumber, index) => {
      const day = new Date(this.calendarService.year, this.calendarService.zeroIndexedMonth, dayNumber).getDay();
      if (index !== 0 && day === 0) gridRow++;

      const col = (day % 7);
      const gridCol = col + 1;
      const dayName = this.calendarService.weekdayNames[col];
      this.lastCol = gridCol;

      dayData.push({ 'gridRow': gridRow, 'gridCol': gridCol, 'name': dayName, 'dayInMonthArrayIndex': dayNumber });
    });

    this.lastGridRow = gridRow;
    this.penultimateGridRow = gridRow - 1;

    return dayData;
  }

  constructor(
    private calendarRepo: CalendarRepo,
    private loginHelper: LoginHelper,
    private menuService: MenuService,
    public calendarService: CalendarService
  ) {
    let date = new Date();
    this.calendarService.year = date.getFullYear();
    this.calendarService.zeroIndexedMonth = date.getMonth();

    this.calendarService.today = { 'year': this.calendarService.year, 'month': this.calendarService.zeroIndexedMonth, 'day': date.getDate() };
  }

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
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.calendarRepo.calendarRecords.observers.forEach(element => { element.complete(); });
    this.calendarRepo.calendarRecords.next({});

    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'dayData': {}, 'open': false });
  }

  getDayName(dayNumber) {
    return Object.keys(this.calendarService.daysEnum)[dayNumber];
  }

  getRecordsByDay(day) {
    const records = this.calendarService.records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

  changeMonth(isNextMonth: boolean) {
    let zeroIndexedMonth = this.calendarService.zeroIndexedMonth;
    let oneIndexedMonth = this.calendarService.zeroIndexedMonth + 1;

    let year = this.calendarService.year;

    let tempDate = new Date(`${year} ${oneIndexedMonth}`);

    if (isNextMonth) tempDate.setMonth(zeroIndexedMonth + 1);
    else tempDate.setMonth(zeroIndexedMonth - 1);

    this.calendarService.year = tempDate.getFullYear();
    this.calendarService.zeroIndexedMonth = tempDate.getMonth();

    this.calendarRepo.calendarRecords.next({});
    this.calendarRepo.getCalendarRecords(this.calendarService.year, this.calendarService.zeroIndexedMonth);

    this.calendarService.closeAddOrUpdateEventForm.next(true);
  }

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

  private compareByTime(a, b) {
    const is_hour_a_before_b = a.hour < b.hour ? true : (a.hour === b.hour ? null : false);
    const is_minute_a_before_b = a.minute < b.minute ? true : (a.minute === b.minute ? null : false);

    const is_a_before_b = is_hour_a_before_b || (is_hour_a_before_b === null && is_minute_a_before_b);
    const is_a_same_as_b = is_hour_a_before_b === null && is_minute_a_before_b === null;

    return is_a_before_b ? -1 : (is_a_same_as_b ? 1 : 0);
  }
}
