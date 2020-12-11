import { Component, OnInit, OnDestroy } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CalendarRepo } from '../services/calendar.repo';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-main',
  templateUrl: './calendar-main.component.html',
  styleUrls: ['./calendar-main.component.css']
})
export class CalendarMainComponent implements OnInit, OnDestroy {
  monthOrWeek: string = 'month';
  calendarViews = ['Month', 'Week', 'Day'];
  title: string;

  get width() { return window.innerWidth; }

  constructor(
    private calendarRepo: CalendarRepo,
    public calendarService: CalendarService,
  ) {
    fromEvent(window, 'resize').pipe(debounceTime(1000)).subscribe(() => { this.width; });
  }

  async ngOnInit() {
    await this.calendarRepo.getAllRecords();
    await this.calendarRepo.getCalendarRecords(parseInt(`${this.calendarService.year}`), parseInt(`${this.calendarService.zeroIndexedMonth}`));
  }

  ngOnDestroy() { }

  updateCalendarView(value: string) {
    if (this.calendarViews.includes(value))
      this.monthOrWeek = value.toLowerCase();
    else
      console.error(`Invalid calendar view selected in dropdown: '${value}'.`);

    this.calendarService.closeAddOrUpdateEventForm.next(true);
  }

  updateMonth(value: number) {
    this.calendarService.zeroIndexedMonth = value;
    this.calendarService.updateRecords();
  }

  updateYear(value: number) {
    this.calendarService.year = value;
    this.calendarService.updateRecords();
  }

  getSelectedMonth(month: string) {
    return this.calendarService.monthNames[parseInt(`${this.calendarService.zeroIndexedMonth}`)].toLowerCase() === month.toLowerCase();
  }

  getSelectedYear(year: number) {
    return this.calendarService.year === year;
  }
}
