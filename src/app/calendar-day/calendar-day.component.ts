import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginHelper } from '../helpers/login-helper';
import { CalendarService } from '../services/calendar.service';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.css']
})
export class CalendarDayComponent implements OnInit, OnDestroy {

  constructor(
    private loginHelper: LoginHelper,
    private menuService: MenuService,
    public calendarService: CalendarService
  ) { }

  ngOnInit(): void {
    this.menuService.disableMenuItem('undo-click');

    if (!this.loginHelper.checkPersonSelected()) this.loginHelper.setPerson();

    this.calendarService.resetSubsciptions();
  }

  ngOnDestroy() {
    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'dayData': {}, 'open': false });
  }

  get hoursOfDay() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i)
    }
    return hours;
  }

  get dateTimeRecords() {
    let allRecordsGroupedByHour = [];

    for (const groupedRecord of this.getCalendardRecordHourGroupsByDay(this.calendarService.day)) {
      let recordsGroupedByHour = {
        'hour': groupedRecord.hour,
        'day': this.calendarService.day,
        'records': groupedRecord.records,
        'col': 2
      }
      allRecordsGroupedByHour.push(recordsGroupedByHour);
    }

    return allRecordsGroupedByHour;
  }

  get dateTimeEmptyRecords() {
    let emptyHoursData = [];

    for (const emptyHour of this.getEmptyHoursByDay(this.calendarService.day)) {
      let empytHourData = {
        'hour': emptyHour,
        'day': this.calendarService.day,
        'col': 1
      }
      emptyHoursData.push(empytHourData);

    }
    return emptyHoursData;
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
