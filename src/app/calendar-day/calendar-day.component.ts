import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarRecord } from '../models/calendar-record.model';
import { CalendarService } from '../services/calendar.service';
import { getHours, getDate, getYear, getMonth, format, setDate, setHours, setMinutes } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.css']
})
export class CalendarDayComponent implements OnInit, OnDestroy {
  records: CalendarRecord[] = [];
  currentDate: Date = null;
  todaysDate: Date = null;

  constructor(
    public calendarService: CalendarService
  ) { }

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.subscriptions.push(this.calendarService.calendarRecordsSubject.subscribe((records: CalendarRecord[]) => {
      this.records = records;
    }));

    this.subscriptions.push(this.calendarService.currentDateSubject.subscribe((currentDate: Date) => {
      this.currentDate = currentDate;
    }));
    this.subscriptions.push(this.calendarService.todayDateSubject.subscribe((todaysDate: Date) => {
      this.todaysDate = todaysDate;
    }));
  }

  ngAfterViewInit() {
    // scroll to current time
    const currentHour = new Date().getHours();
    const hourElement = document.querySelectorAll(".date-box")[currentHour];
    const yPositionOfHourElement = Math.abs(hourElement.getBoundingClientRect().y);
    window.scrollTo(0, yPositionOfHourElement + (window.innerHeight - 100) / 2);
  }

  ngOnDestroy() {
    this.calendarService.openUpdateEventForm.next({ 'record': {}, 'open': false });
    this.calendarService.openAddEventForm.next({ 'date': {}, 'open': false });

    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  get dateTitle() {
    const dateTitle = format(this.currentDate, 'EEEE do LLLL yyyy', { locale: enGB });
    return dateTitle;
  }
  get year(): number {
    return getYear(this.currentDate);
  }
  get month(): number {
    return getMonth(this.currentDate);
  }
  get day(): number {
    return getDate(this.currentDate);
  }
  get todayYear(): number {
    return getYear(this.todaysDate);
  }
  get todayMonth(): number {
    return getMonth(this.todaysDate);
  }
  get todayDay(): number {
    return getDate(this.todaysDate);
  }

  get dateTimeRecords(): { hour: number; day: number; records: CalendarRecord[]; col: number; }[] {
    // Group the records by hour
    const recordsByHour = [];
    this.records.filter(record => getDate(record.dateTime) === this.day).forEach((record) => {
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
    const hoursInUse = this.records.filter(record => getDate(record.dateTime) === this.day).map((record) => getHours(record.dateTime));

    // Filter out the hours that are already in use
    const unusedHours = this.calendarService.hoursOfDay.filter((hour) => !hoursInUse.includes(hour.value))
      .map((hour) => {
        return { hour: hour.value, col: 1, day: getDate(this.currentDate) };
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

  openAddEventForm(dayOfMonth: number, hour: number): void {
    let date = new Date(this.calendarService.currentDate);
    date = setDate(date, dayOfMonth);
    date = setHours(date, hour);
    date = setMinutes(date, 0);
    this.calendarService.openAddEventForm.next({ 'date': date, 'open': true });
  }
}
