import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarHelper } from '../helpers/calendar-helper';
import { CalendarRecord } from '../models/calendar-record.model';
import { CalendarService } from '../services/calendar.service';
import { getHours, getDate, getYear, getMonth, format } from 'date-fns';
import { enGB } from 'date-fns/locale';

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

  ngOnInit(): void { }

  ngAfterViewInit() {
    // scroll to current time
    const currentHour = new Date().getHours();
    const hourElement = document.querySelectorAll(".date-box")[currentHour];
    const yPositionOfHourElement = Math.abs(hourElement.getBoundingClientRect().y);
    window.scrollTo(0, yPositionOfHourElement + (window.innerHeight - 100) / 2);
  }

  ngOnDestroy() {
    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'dayData': {}, 'open': false });
  }

  get dateTitle() {
    return format(this.calendarService.currentDate, 'EEEE do LLLL yyyy', { locale: enGB });
  }
  get year(): number {
    return getYear(this.calendarService.currentDate);
  }
  get month(): number {
    return getMonth(this.calendarService.currentDate);
  }
  get day(): number {
    return getDate(this.calendarService.currentDate);
  }
  get todayYear(): number {
    return getYear(this.calendarService.today);
  }
  get todayMonth(): number {
    return getMonth(this.calendarService.today);
  }
  get todayDay(): number {
    return getDate(this.calendarService.today);
  }

  get dateTimeRecords(): { hour: number; day: number; records: CalendarRecord[]; col: number; }[] {
    // Group the records by hour
    const recordsByHour = [];
    this.calendarService.calendarRecords.forEach((record) => {
      const hour = getHours(record.dateTime);
      const hourObj = recordsByHour.find((obj) => obj.hour === hour);
      if (hourObj)
        hourObj.records.push(record);
      else
        recordsByHour.push({ hour: hour, col: 2, day: getDate(record.dateTime), records: [record] });
    });

    return recordsByHour;
  }

  get dateTimeEmptyRecords(): { hour: number, day: number, col: number }[] {
    const hoursInUse = this.calendarService.calendarRecords.map((record) => getHours(record.dateTime));

    // Filter out the hours that are already in use
    const unusedHours = this.calendarHelper.hoursOfDay().filter((hour) => !hoursInUse.includes(hour.value))
      .map((hour) => {
        return { hour: hour.value, col: 1, day: getDate(this.calendarService.currentDate) };
      });
    return unusedHours;
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
