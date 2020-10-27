import { Component, OnInit, OnDestroy} from '@angular/core';

import { LoginHelper } from '../helpers/login-helper';
import { MenuService } from '../services/menu.service';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-week',
  templateUrl: './calendar-week.component.html',
  styleUrls: ['./calendar-week.component.css'],
  template: `<input [(ngModel)]="prop">`
})
export class CalendarWeekComponent implements OnInit, OnDestroy {
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
    return allRecordsGroupedByHour;
  }

  get dateTimeEmptyRecords() {
    let emptyHoursData = [];
    let validDays = this.dayDataForWeek.valid;
    for (const validDay of validDays) {
      for (const emptyHour of this.getEmptyHoursByDay(validDay.dayInMonthArrayIndex)) {
        let empytHourData = {
          'hour': emptyHour,
          'day': validDay.dayInMonthArrayIndex,
          'col': validDay.gridCol
        }
        emptyHoursData.push(empytHourData);
      }
    }
    return emptyHoursData;
  }

  get dateTimeInvalidEmptyRecords() {
    let emptyHoursData = [];
    let invalidDays = this.dayDataForWeek.invalid;
    for (const validDay of invalidDays) {
      for (const emptyHour of this.hoursOfDay) {
        let empytHourData = {
          'hour': emptyHour,
          'day': validDay.dayInMonthArrayIndex,
          'col': validDay.gridCol
        }
        emptyHoursData.push(empytHourData);
      }
    }
    return emptyHoursData;
  }

  get hoursOfDay() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i)
    }
    return hours;
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

  hourToInt(hour) {
    return parseInt(hour);
  }

  getEmptyHoursByDay(calendarDay) {
    const records = this.calendarService.getRecordsByDay(calendarDay);
    const emptyHours = this.hoursOfDay.filter(hour => !records.map(rec => parseInt(rec['hour'])).includes(hour));
    emptyHours.forEach((hour: string) => hour = this.calendarService.padToTwo(parseInt(hour)));
    return emptyHours;
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

  openUpdateEventForm(record) {
    this.calendarService.openUpdateEventForm.next({ 'record': record, 'open': true });
  }

  openAddEventForm(dayData) {
    this.calendarService.openAddEventForm.next({ 'dayData': dayData, 'open': true });
  }
}
