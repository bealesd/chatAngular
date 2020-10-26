import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

import { LoginHelper } from '../helpers/login-helper';
import { CalendarRepo } from './../services/calendar.repo';
import { MenuService } from '../services/menu.service';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.css'],
  template: `<input [(ngModel)]="prop">`
})
export class CalendarWeekComponent implements OnInit, OnDestroy {
  @HostBinding("style.--record-border-thickness")
  private recordBorderThickness: string = '2px';
  @HostBinding("style.--record-border-type")
  private recordBorderType: string = 'solid';

  @HostBinding("style.--record-border-red-color")
  private recordBorderRedColor: string = 'rgb(255, 53, 94)';
  @HostBinding("style.--record-border-red")
  private recordBorderRed: string = `${this.recordBorderRedColor} ${this.recordBorderThickness} ${this.recordBorderType}`;

  @HostBinding("style.--record-border-orange-color")
  private recordBorderOrangeColor: string = 'rgb(255, 96, 55)';
  @HostBinding("style.--record-border-orange")
  private recordBorderOrange: string = `${this.recordBorderOrangeColor} ${this.recordBorderThickness} ${this.recordBorderType}`;

  @HostBinding("style.--record-border-yellow-color")
  private recordBorderYellowColor: string = 'rgb(255, 204, 51)';
  @HostBinding("style.--record-border-yellow")
  private recordBorderYellow: string = `${this.recordBorderYellowColor} ${this.recordBorderThickness} ${this.recordBorderType}`;

  @HostBinding("style.--record-border-green-color")
  private recordBorderGreenColor: string = 'rgb(102, 255, 102)';
  @HostBinding("style.--record-border-green")
  private recordBorderGreen: string = `${this.recordBorderGreenColor} ${this.recordBorderThickness} ${this.recordBorderType}`;

  @HostBinding("style.--record-border-light-blue-color")
  private recordBorderLightBlueColor: string = 'rgb(80, 191, 230)';
  @HostBinding("style.--record-border-light-blue")
  private recordBorderLightBlue: string = `${this.recordBorderLightBlueColor} ${this.recordBorderThickness} ${this.recordBorderType}`;

  @HostBinding("style.--record-border-pink-color")
  private recordBorderPinkColor: string = 'rgb(255, 0, 204)';
  @HostBinding("style.--record-border-pink")
  private recordBorderPink: string = `${this.recordBorderPinkColor} ${this.recordBorderThickness} ${this.recordBorderType}`;

  @HostBinding("style.--record-border-violet-color")
  private recordBorderVioletColor: string = 'rgb(150, 78, 202)';
  @HostBinding("style.--record-border-violet")
  private recordBorderViolet: string = `${this.recordBorderVioletColor} ${this.recordBorderThickness} ${this.recordBorderType}`;


  subscriptions: Subscription[] = [];
  lastGridRow: number;
  penultimateGridRow: number;
  resizeObservable$: any;
  resizeSubscription$: any;
  innerWidth: number;

  get dayDataForWeek() {
    const dayData = { 'invalid': [], 'valid': [] };
    this.calendarService.calendarDaysInWeek.valid.forEach((dayNumber) => {
      const day = new Date(this.calendarService.year, this.calendarService.zeroIndexedMonth, dayNumber).getDay();

      const col = (day % 7);
      const dayName = this.calendarService.weekdayNames[col];

      dayData.valid.push({ 'gridCol': col + 1, 'name': dayName, 'dayInMonthArrayIndex': dayNumber });
    });

    this.calendarService.calendarDaysInWeek.empty.forEach((dayInfo) => {
      dayData.invalid.push({ 'gridCol': dayInfo.col, 'name': dayInfo.name, 'dayInMonthArrayIndex': dayInfo.dayInMonthArrayIndex });
    });

    return dayData;
  }

  fillEmptyRecords() {
    const cols = 8;
    const rows = 25;

    const invalidCols = this.dayDataForWeek.invalid.map(row => row.gridCol + 1)
    document.querySelectorAll('.date-box-contianer > .date-box.empty').forEach(div => div.remove());

    const dateBoxContianer = document.querySelector('.date-box-contianer');
    for (let col = 1; col <= cols; col++) {
      for (let row = 2; row <= rows; row++) {
        const isInvalidDiv = invalidCols.includes(col);
        const dateBox = document.querySelector(`[data-col="${col}"][data-row="${row}"]`);
        if (dateBox === null || dateBox === undefined) {
          const div = document.createElement('div');
          div.classList.add('date-box');
          div.classList.add('empty')
          div.dataset.col = `${col}`;
          div.style.gridColumn = `${col}`;
          div.dataset.row = `${row}`;
          div.style.gridRow = `${row}`;
          this.styleDateBoxBorder(div);
          if (isInvalidDiv) {
            div.style.backgroundSize = '5px 5px';
            div.style.backgroundImage = `linear-gradient(
              45deg,
              rgba(255,255,255,0.5) 25%,
              transparent 25%,
              transparent 50%,
              rgba(255,255,255,0.5) 50%,
              rgba(255,255,255,0.5) 75%,
              transparent 75%,
              transparent
              )`;
          }
          else {
            div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }
          dateBoxContianer.append(div);
        }
      }
    }
  }

  styleDateBoxBorder(div) {
    if ((parseInt(div.dataset.col) - 1) === 1) {
      div.style.borderLeft = this.recordBorderRed;
      div.style.borderTop = this.recordBorderRed;
      if (parseInt(div.dataset.row) === 25)
        div.style.borderBottom = this.recordBorderRed;
    }
    else if ((parseInt(div.dataset.col) - 1) === 2) {
      div.style.borderLeft = this.recordBorderOrange;
      div.style.borderTop = this.recordBorderOrange;
      if (parseInt(div.dataset.row) === 25)
        div.style.borderBottom = this.recordBorderOrange;
    }
    else if ((parseInt(div.dataset.col) - 1) === 3) {
      div.style.borderLeft = this.recordBorderYellow;
      div.style.borderTop = this.recordBorderYellow;
      if (parseInt(div.dataset.row) === 25)
        div.style.borderBottom = this.recordBorderYellow;
    }
    else if ((parseInt(div.dataset.col) - 1) === 4) {
      div.style.borderLeft = this.recordBorderGreen;
      div.style.borderTop = this.recordBorderGreen;
      if (parseInt(div.dataset.row) === 25)
        div.style.borderBottom = this.recordBorderGreen;
    }
    else if ((parseInt(div.dataset.col) - 1) === 5) {
      div.style.borderLeft = this.recordBorderLightBlue;
      div.style.borderTop = this.recordBorderLightBlue;
      if (parseInt(div.dataset.row) === 25)
        div.style.borderBottom = this.recordBorderLightBlue;
    }
    else if ((parseInt(div.dataset.col) - 1) === 6) {
      div.style.borderLeft = this.recordBorderPink;
      div.style.borderTop = this.recordBorderPink;
      if (parseInt(div.dataset.row) === 25)
        div.style.borderBottom = this.recordBorderPink;
    }
    else if ((parseInt(div.dataset.col) - 1) === 7) {
      div.style.borderLeft = this.recordBorderViolet;
      div.style.borderRight = this.recordBorderViolet;
      div.style.borderTop = this.recordBorderViolet;
      if (parseInt(div.dataset.row) === 25)
        div.style.borderBottom = this.recordBorderViolet;
    }
  }

  addOridnalIndictor(day) {
    const j = day % 10;
    const k = day % 100;
    let oridnalIndictor;
    if (j == 1 && k != 11)
      oridnalIndictor = "st";
    else if (j == 2 && k != 12)
      oridnalIndictor = "nd";
    else if (j == 3 && k != 13)
      oridnalIndictor = "rd";
    else
      oridnalIndictor = "th";
    return oridnalIndictor;
  }

  get dateTimeRecords() {
    let allRecordsGroupedByHour = [];
    let validDays = this.dayDataForWeek.valid;
    for (const validDay of validDays) {
      for (const groupedRecord of this.getCalendardRecordHourGroupsByDay(validDay.dayInMonthArrayIndex)) {
        let recordsGroupedByHour = {
          'hour': groupedRecord.hour,
          'day': validDay.dayInMonthArrayIndex,
          'records': groupedRecord.records,
          'col': validDay.gridCol
        }
        allRecordsGroupedByHour.push(recordsGroupedByHour);
      }
    }
    this.fillEmptyRecords();
    return allRecordsGroupedByHour;
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

    let allGroupedRecords = [];
    for (let i = 0; i < Object.keys(grouped).length; i++) {
      const hour = Object.keys(grouped)[i];
      allGroupedRecords.push({
        'hour': hour,
        'records': grouped[hour]
      });
    }

    return allGroupedRecords;
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
    this.resizeObservable$ = fromEvent(window, 'resize')
    this.resizeSubscription$ = this.resizeObservable$.subscribe(evt => {
      if (window.innerWidth < 800)
        this.recordBorderThickness = '1px';
      else if (window.innerWidth >= 800)
        this.recordBorderThickness = '2px';
    })

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
