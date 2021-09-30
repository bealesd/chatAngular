import { Component, OnInit, OnDestroy } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CalendarHelper } from '../helpers/calendar-helper';
import { CalendarService } from '../services/calendar.service';
import { MessageService } from '../services/message.service';

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
    public calendarService: CalendarService,
    public calendarHelper: CalendarHelper,
    public messageService: MessageService
  ) {
    fromEvent(window, 'resize').pipe(debounceTime(1000)).subscribe(() => { this.width; });
  }

  async ngOnInit() {
    await this.calendarService.getCalendarRecords();
  }

  ngOnDestroy() { }

  updateCalendarView(value: string) {
    if (this.calendarViews.includes(value))
      this.monthOrWeek = value.toLowerCase();
    else
      this.messageService.add(`Invalid calendar view selected in dropdown: '${value}'.`, 'error');

    this.calendarService.closeAddOrUpdateEventForm.next(true);
  }

  updateMonth(value: number) {
    this.calendarService.month = value;
    this.calendarService.updateRecords();
  }

  updateYear(value: number) {
    this.calendarService.year = value;
    this.calendarService.updateRecords();
  }

  changeWeekOrMonth(direction){
    if (this.monthOrWeek === 'month')
      this.calendarService.changeMonth(direction);
    else if (this.monthOrWeek === 'week')
      this.calendarService.changeWeek(direction)
    else
      this.calendarService.changeDay(direction)
  }
}
