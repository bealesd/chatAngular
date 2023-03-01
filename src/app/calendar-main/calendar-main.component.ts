import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalendarHelper } from '../helpers/calendar-helper';
import { CalendarService } from '../services/calendar.service';
import { MessageService } from '../services/message.service';

import { setMonth, setYear, getYear, getMonth } from 'date-fns';

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
    return this.calendarHelper.getFormInputMonthFromMonthAndYear(getYear(this.calendarService.currentDate), getMonth(this.calendarService.currentDate));
  }

  constructor(
    public calendarService: CalendarService,
    public calendarHelper: CalendarHelper,
    public messageService: MessageService
  ) { }

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

  async updateDate(value) {
    this.calendarService.currentDate = setYear(this.calendarService.currentDate, parseInt(value.split('-')[0]));
    this.calendarService.currentDate = setMonth(this.calendarService.currentDate, parseInt(value.split('-')[1]) - 1);
    await this.calendarService.updateRecords();
  }

  async changeWeekOrMonth(direction) {
    if (this.monthOrWeek === 'month')
      await this.calendarService.changeMonth(direction);
    else if (this.monthOrWeek === 'week')
      await this.calendarService.changeWeek(direction)
    else
      await this.calendarService.changeDay(direction)
  }

  openAddEventForm() {
    const now = new Date();
    this.calendarService.openAddEventForm.next({ 'open': true, 'dayData': { 'dayInMonthArrayIndex': now.getUTCDate(), 'hour': now.getUTCHours() } });
  }
}
