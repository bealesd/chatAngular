import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { CalendarRecord } from '../models/calendar-record.model';
import { MessageService } from './message.service';
import { environment } from 'src/environments/environment';

import {
  format, getYear, getMonth, startOfToday, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks, compareAsc, getDate
} from 'date-fns'
import { enGB } from 'date-fns/locale';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnDestroy {
  public subscriptions: Subscription[] = [];

  public closeAddOrUpdateEventForm = new BehaviorSubject<boolean>(true);
  public openUpdateEventForm = new BehaviorSubject<any>({});
  public openAddEventForm = new BehaviorSubject<any>({});

  public calendarRecordsSubject = new BehaviorSubject<any>([]);
  public currentDateSubject = new BehaviorSubject<Date>(null);
  public todayDateSubject = new BehaviorSubject<any>(null);

  today: Date;
  calendarRecords: CalendarRecord[] = [];

  public currentDate: Date;
  private baseUrl = `${environment.chatCoreUrl}/calendar`;

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient,
    private loginService: LoginService) {

    this.currentDate = new Date();
    this.currentDateSubject.next(new Date());

    this.setTodaysDate();
    this.subscriptions.push(interval(1000 * 60 * 5).subscribe(() => this.setTodaysDate()));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => { subscription.unsubscribe(); });
    this.subscriptions = [];
  }

  async deleteCalendarRecord(id: number): Promise<void> {
    this.messageService.add(`CalendarRepo: Deleting calendar record id: ${id}.`, 'info');

    const result = await this.DeleteChat(id);
    if (result) {
      const recordsToKeep = this.calendarRecords.filter(r => r.id !== id);
      this.calendarRecords = recordsToKeep
      this.messageService.add(`CalendarRepo: Deleted calendar record id: ${id}.`, 'info');
    }
    else {
      this.messageService.add(`CalendarRepo: Deleting calendar record failed: ${id}.`, 'error');
    }
  }

  DeleteChat(id): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/DeleteRecord?id=${id}`;
      this.httpClient.delete(url).subscribe(
        {
          next: (recordObject: any) => {
            res(true);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async postCalendarRecord(record: CalendarRecord): Promise<void> {
    let result = await this.PostRecord(record);

    if (!result) {
      this.messageService.add(`CalendarRepo: failed to post calendar record: ${JSON.stringify(record)}.`, 'error');
    }
    else {
      this.messageService.add(`Posted calendar record: ${JSON.stringify(record)}.`, 'info');
      this.calendarRecords.push(result);
    }
  }

  async updateCalendarRecord(record: CalendarRecord): Promise<void> {
    const result = await this.UpdateRecord(record);
    if (!result)
      this.messageService.add(`CalendarRepo: failed to update calendar record: ${JSON.stringify(record)}.`, 'error');
    else {
      this.messageService.add(`Updated calendar record: ${JSON.stringify(record)}.`, 'info');

      let localRecord: CalendarRecord;
      localRecord = this.calendarRecords.find(r => r.id === record.id)
      localRecord.what = record.what;
      localRecord.description = record.description;
      localRecord.id = record.id;
      localRecord.dateTime instanceof Date ? record.dateTime : new Date(record.dateTime);

      const currentDate = this.currentDateSubject.getValue();
      if (getMonth(currentDate) !== getMonth(record.dateTime) || getYear(currentDate) !== getYear(record.dateTime))
        this.calendarRecords = this.calendarRecords.filter(r => r.id !== record.id);
    }
  }

  UpdateRecord(record: any): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/UpdateRecord`;
      this.httpClient.put(url, record).subscribe(
        {
          next: (result: any) => {
            res(true);
          },
          error: (err: any) => {
            res(false);
          }
        }
      );
    });
  }

  PostRecord(record: any): Promise<any> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/AddRecord`;
      this.httpClient.post(url, record).subscribe(
        {
          next: (recordObject: CalendarRecord) => {
            const record = new CalendarRecord();
            record.id = recordObject.id;
            record.what = recordObject.what;
            record.description = recordObject.description;
            record.dateTime instanceof Date ? recordObject.dateTime : new Date(recordObject.dateTime);
            res(record);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async GetRecordsByYearAndMonth(year: number, month: number):
    // make request service, that does what ServerErrorInterceptor does
    // move to fetch api
    Promise<any[]> {
    const url = `${this.baseUrl}/GetRecords?year=${year}&month=${month}`;

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', `Bearer ${this.loginService.jwtToken}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: myHeaders,
      });
      const records = await response.json();
      const calendarRecords: CalendarRecord[] = [];
      for (const recordObject of records) {
        const record = new CalendarRecord();
        record.id = recordObject.id;
        record.what = recordObject.what;
        record.description = recordObject.description;
        record.dateTime = recordObject.dateTime instanceof Date ? recordObject.dateTime : new Date(recordObject.dateTime);
        calendarRecords.push(record);
      }
      return calendarRecords;
    } catch (error) {
      return null;
    }
  }

  async getCalendarRecords(): Promise<void> {
    const currentDate = this.currentDateSubject.getValue();
    this.messageService.add(`CalendarRepo: Getting calendar record for: ${getYear(currentDate)}-${getMonth(currentDate) + 1}.`);
    this.calendarRecords = [];
    const records = await this.GetRecordsByYearAndMonth(getYear(currentDate), getMonth(currentDate));

    if (records) {
      this.calendarRecords = records;
      this.calendarRecordsSubject.next(records);
      this.messageService.add(`CalendarRepo: Got calendar records for: ${getYear(currentDate)}-${getMonth(currentDate) + 1}.`);
    }
    else {
      this.messageService.add(`CalendarRepo: Get calendar records failed for: ${getYear(currentDate)}-${getMonth(currentDate) + 1}.`, 'error');
      this.calendarRecords = [];
      this.calendarRecordsSubject.next([]);
    }
  }

  setTodaysDate() {
    this.today = startOfToday();
    this.todayDateSubject.next(this.today);
  }

  async changeDay(nextOrPrevious: string) {
    let currentDate = this.currentDateSubject.getValue();

    if (nextOrPrevious === 'next')
      currentDate = addDays(currentDate, 1);
    else
      currentDate = subDays(currentDate, 1);

    this.currentDateSubject.next(currentDate);

    await this.getCalendarRecords();
    this.closeAddOrUpdateEventForm.next(true);
  }

  async changeWeek(nextOrPrevious: string) {
    let currentDate = this.currentDateSubject.getValue();

    if (nextOrPrevious === 'next')
      currentDate = addWeeks(currentDate, 1);
    else
      currentDate = subWeeks(currentDate, 1);

    this.currentDateSubject.next(currentDate);

    await this.getCalendarRecords();
    this.closeAddOrUpdateEventForm.next(true);
  }

  async changeMonth(nextOrPrevious: string) {
    let currentDate = this.currentDateSubject.getValue();

    if (nextOrPrevious === 'next')
      currentDate = addMonths(currentDate, 1);
    else
      currentDate = subMonths(currentDate, 1);

    this.currentDateSubject.next(currentDate);

    await this.getCalendarRecords();

    this.closeAddOrUpdateEventForm.next(true);
  }

  async updateRecords() {
    this.calendarRecords = [];
    await this.getCalendarRecords();

    this.closeAddOrUpdateEventForm.next(true);
  }

  async changeToToday() {
    this.today = startOfToday();
    this.todayDateSubject.next(this.today);
    this.currentDateSubject.next(this.today);
    await this.getCalendarRecords();
  }

  getDayNameLongForMonth() {
    const dayName = format(this.currentDateSubject.getValue(), 'LLLL', { locale: enGB });
    return dayName;
  }

  getDayNameShortForMonth(day: number): string {
    const dayName = format(this.currentDateSubject.getValue(), 'LLL', { locale: enGB });
    return dayName;
  }

  get hoursOfDay(): any[] {
    return [...Array(24).keys()].map((hour) => Object({ toString: () => `${hour}`.padStart(2, '0'), value: hour }))
  }
}
