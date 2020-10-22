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
  lastCol: number;

  get dayDataForWeek() {
    const dayData = {'empty': [], 'valid': []};
    // blank all data data for drawing, work out what days are not drawn
    this.calendarService.calendarDaysInWeek.valid.forEach((dayNumber, index) => {
      const day = new Date(this.calendarService.year, this.calendarService.zeroIndexedMonth, dayNumber).getDay();

      const col = (day % 7);
      const gridCol = col + 1;
      const dayName = this.calendarService.weekdayNames[col];
      this.lastCol = gridCol;

      dayData.valid.push({ 'gridCol': gridCol, 'name': dayName, 'dayInMonthArrayIndex': dayNumber });
    });

    this.calendarService.calendarDaysInWeek.empty.forEach((dayInfo, index) => {
      const date = dayInfo.date;
      const day = date.getDay();
      const calendarDay = date.getDate();

      const gridCol = dayInfo.col;
      const dayName = this.calendarService.weekdayNames[day];
      this.lastCol = gridCol;

      dayData.empty.push({ 'gridCol': gridCol, 'name': dayName, 'dayInMonthArrayIndex': calendarDay });
    });

    return dayData;
  }

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
