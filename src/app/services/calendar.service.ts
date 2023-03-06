import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { CalendarRecord } from '../models/calendar-record.model';
import { MessageService } from './message.service';
import { environment } from 'src/environments/environment';

import {
  format, getYear, getMonth, startOfToday, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks, compareAsc, getDate
} from 'date-fns'
import { enGB } from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnDestroy {
  public subscriptions: Subscription[] = [];

  public closeAddOrUpdateEventForm = new BehaviorSubject<boolean>(true);
  public openUpdateEventForm = new BehaviorSubject<any>({});
  public openAddEventForm = new BehaviorSubject<any>({});

  public calendarRecordsSubject = new BehaviorSubject<any>([]);
  public currentDateSubject = new BehaviorSubject<any>(null);
  public todayDateSubject = new BehaviorSubject<any>(null);

  today: Date;
  calendarRecords: CalendarRecord[] = [];

  public currentDate: Date;
  private baseUrl = `${environment.chatCoreUrl}/calendar`;

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient) {

    this.currentDate = new Date();
    this.currentDateSubject.next(this.currentDate);

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

      if (getMonth(this.currentDate) !== getMonth(record.dateTime) || getYear(this.currentDate) !== getYear(record.dateTime))
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

  GetRecordsByYearAndMonth(year: number, month: number): Promise<any[]> {
    return new Promise((res, rej) => {
      const url = `${this.baseUrl}/GetRecords?year=${year}&month=${month}`;
      this.httpClient.get<any[]>(url).subscribe(
        {
          next: (records: any[]) => {
            const calendarRecords: CalendarRecord[] = [];
            for (let i = 0; i < records.length; i++) {
              const recordObject = records[i];

              const record = new CalendarRecord();
              record.id = recordObject.id;
              record.what = recordObject.what;
              record.description = recordObject.description;
              record.dateTime = recordObject.dateTime instanceof Date ? recordObject.dateTime : new Date(recordObject.dateTime);
              calendarRecords.push(record);
            }
            res(calendarRecords);
          },
          error: (err: any) => {
            res(null);
          }
        }
      );
    });
  }

  async getCalendarRecords(): Promise<void> {
    this.messageService.add(`CalendarRepo: Getting calendar record for: ${getYear(this.currentDate)}-${getMonth(this.currentDate) + 1}.`);
    this.calendarRecords = [];
    const records = await this.GetRecordsByYearAndMonth(getYear(this.currentDate), getMonth(this.currentDate));

    if (records) {
      this.calendarRecords = records;
      this.calendarRecordsSubject.next(records);
      this.messageService.add(`CalendarRepo: Got calendar records for: ${getYear(this.currentDate)}-${getMonth(this.currentDate) + 1}.`);
    }
    else {
      this.messageService.add(`CalendarRepo: Get calendar records failed for: ${getYear(this.currentDate)}-${getMonth(this.currentDate) + 1}.`, 'error');
      this.calendarRecords = [];
      this.calendarRecordsSubject.next([]);
    }
  }

  setTodaysDate() {
    this.today = startOfToday();
    this.todayDateSubject.next(this.today);
  }

  async changeDay(nextOrPrevious: string) {
    if (nextOrPrevious === 'next')
      this.currentDate = addDays(this.currentDate, 1);
    else
      this.currentDate = subDays(this.currentDate, 1);

    this.currentDateSubject.next(this.currentDate);

    await this.getCalendarRecords();
    this.closeAddOrUpdateEventForm.next(true);
  }

  async changeWeek(nextOrPrevious: string) {
    if (nextOrPrevious === 'next')
      this.currentDate = addWeeks(this.currentDate, 1);
    else
      this.currentDate = subWeeks(this.currentDate, 1);

    this.currentDateSubject.next(this.currentDate);

    await this.getCalendarRecords();
    this.closeAddOrUpdateEventForm.next(true);
  }

  async changeMonth(nextOrPrevious: string) {
    if (nextOrPrevious === 'next')
      this.currentDate = addMonths(this.currentDate, 1);
    else
      this.currentDate = subMonths(this.currentDate, 1);

    this.currentDateSubject.next(this.currentDate);

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
    await this.getCalendarRecords();
  }

  getDayNameLongForMonth() {
    const dayName = format(this.currentDate, 'LLLL', { locale: enGB });
    return dayName;
  }

  getDayNameShortForMonth(day: number): string {
    const dayName = format(this.currentDate, 'LLL', { locale: enGB });
    return dayName;
  }

  get hoursOfDay(): any[] {
    return [...Array(24).keys()].map((hour) => Object({ toString: () => `${hour}`.padStart(2, '0'), value: hour }))
  }
}
