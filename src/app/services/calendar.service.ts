import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MessageService } from '../services/message.service';
import { CalendarRepo } from './calendar.repo'
import { RestHelper } from '../helpers/rest-helper';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  public calendarRecords = new BehaviorSubject<any>({});

  public closeAddOrUpdateEventForm = new BehaviorSubject<boolean>(true);
  public openUpdateEventForm = new BehaviorSubject<any>({});
  public openAddEventForm = new BehaviorSubject<any>({});

  constructor(private messageService: MessageService, private calendarRepo: CalendarRepo, private restHelper: RestHelper) {
  }
  // TODO - going to be used to manage all calendar data, and will be used by calendar month and calendar week components.

  daysEnum = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  };

  daysLongEnum = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  get weekdayNames(): string[] {
    return Object.keys(this.daysEnum);
  }

  monthsEnum = {
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11
  }

  get monthNames(): string[] {
    return Object.keys(this.monthsEnum);
  }

  get daysInMonth() {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(this.year, this.zeroIndexedMonth + 1, 0).getDate();
  }

  get daysInMonthArray() {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    const days: number[] = [];
    for (let i = 1; i <= (this.daysInMonth); i++) days.push(i);
    return days;
  }

  year: number;

  zeroIndexedMonth: number;

  today: {};

  monthName: string;

  records: [] = [];

  

}
