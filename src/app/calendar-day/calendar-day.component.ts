import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarHelper } from '../helpers/calendar-helper';
import { CalendarRecord } from '../models/calendar-record.model';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.css']
})
export class CalendarDayComponent implements OnInit, OnDestroy {

  constructor(
    public calendarService: CalendarService,
    public calendarHelper: CalendarHelper
  ) { }

  ngOnInit(): void {  }

  ngOnDestroy() {
    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'dayData': {}, 'open': false });
  }

  get dateTimeRecords(): { hour: number; day: number; records: CalendarRecord[]; col: number; }[] {
    const allRecordsGroupedByHour: { hour: number, day: number, records: CalendarRecord[], col: number }[] = [];
    for (let groupedRecord of this.calendarHelper.getRecordsGroupedByHourForDay(this.calendarService.year, this.calendarService.month,this.calendarService.day, this.calendarService.calendarRecords)) {
      const recordsGroupedByHour = {
        hour: groupedRecord.hour,
        day: this.calendarService.day,
        records: groupedRecord.records,
        col: 2
      }
      allRecordsGroupedByHour.push(recordsGroupedByHour);
    }
    return allRecordsGroupedByHour;
  }

  get dateTimeEmptyRecords(): { hour: number, day: number, col: number }[] {
    const emptyHoursData: { hour: number, day: number, col: number }[] = [];

    for (let emptyHour of this.calendarHelper.getEmptyHoursByDay(this.calendarService.day, this.calendarService.calendarRecords)) {
      const empytHourData = {
        hour: parseInt(emptyHour.value),
        day: this.calendarService.day,
        col: 1
      }
      emptyHoursData.push(empytHourData);
    }
    return emptyHoursData;
  }

  getBorderClass(row: number): string {
    const day = row % 7;
    let borderClass: string;

    if (day === 1)
      borderClass = 'red-border';
    else if (day === 2)
      borderClass = 'orange-border';
    else if (day === 3)
      borderClass = 'yellow-border';
    else if (day === 4)
      borderClass = 'green-border';
    else if (day === 5)
      borderClass = 'light-blue-border';
    else if (day === 6)
      borderClass = 'pink-border';
    else if (day === 7)
      borderClass = 'violet-border';
    else
      borderClass = 'red-border';

    return borderClass;
  }

  openUpdateEventForm(record: { id: string, what: string, day: number, hour: number, minute: number }) {
    this.calendarService.openUpdateEventForm.next({ 'record': record, 'open': true });
  }

  openAddEventForm(dayData: { dayInMonthArrayIndex: number, hour: number }): void {
    this.calendarService.openAddEventForm.next({ 'dayData': dayData, 'open': true });
  }
}
