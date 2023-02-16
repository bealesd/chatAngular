import { Component, OnInit, OnDestroy } from '@angular/core';

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

  get month() {
    return this.calendarHelper.getFormInputMonthFromMonthAndYear(this.calendarService.year, this.calendarService.month);
  }

  constructor(
    public calendarService: CalendarService,
    public calendarHelper: CalendarHelper,
    public messageService: MessageService
  ) {  }

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

  updateDate(value) {
    this.calendarService.year = parseInt(value.split('-')[0]);
    this.calendarService.month = parseInt(value.split('-')[1]) - 1;
    this.calendarService.updateRecords();
  }

  changeWeekOrMonth(direction) {
    if (this.monthOrWeek === 'month')
      this.calendarService.changeMonth(direction);
    else if (this.monthOrWeek === 'week')
      this.calendarService.changeWeek(direction)
    else
      this.calendarService.changeDay(direction)
  }

  openAddEventForm() {
    const now = new Date();
    this.calendarService.openAddEventForm.next({ 'open': true, 'dayData':{'dayInMonthArrayIndex': now.getUTCDate(), 'hour': now.getUTCHours()} });
  }
}
