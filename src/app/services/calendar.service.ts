import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { CalendarHelper } from '../helpers/calendar-helper';
import { CalendarRecord } from '../models/calendar-record.model';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnDestroy {
  public subscriptions: Subscription[] = [];

  public closeAddOrUpdateEventForm = new BehaviorSubject<boolean>(true);
  public openUpdateEventForm = new BehaviorSubject<any>({});
  public openAddEventForm = new BehaviorSubject<any>({});

  today: { year: number; month: number; week: number; day: number; };
  calendarRecords: CalendarRecord[] = [];

  public year: number;
  public month: number;
  public monthName: string;
  public week: number;
  public day: number;
  private baseUrl = 'https://corechatapi.azurewebsites.net/calendar';

  constructor(
    private messageService: MessageService,
    private httpClient: HttpClient,
    private calendarHelper: CalendarHelper) {
    const date = new Date();
    const year = date.getFullYear();
    const zeroIndexedMonth = date.getMonth();

    const firstOfMonth = new Date(year, zeroIndexedMonth, 1);
    const week = Math.ceil((firstOfMonth.getDay() + date.getDate()) / 7);
    const day = date.getDate();

    this.month = zeroIndexedMonth;
    this.year = year;
    this.week = week;
    this.day = day;

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
      localRecord.day = record.day;
      localRecord.hour = record.hour;
      localRecord.minute = record.minute;
      localRecord.id = record.id;
      localRecord.month = record.month;
      localRecord.year = record.year;
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
            record.year = recordObject.year;
            record.month = recordObject.month;
            record.day = recordObject.day;
            record.hour = recordObject.hour;
            record.minute = recordObject.minute;
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
              record.year = recordObject.year;
              record.month = recordObject.month;
              record.day = recordObject.day;
              record.hour = recordObject.hour;
              record.minute = recordObject.minute;

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
    this.messageService.add(`CalendarRepo: Getting calendar record for: ${this.year}-${this.month + 1}.`);
    this.calendarRecords = [];
    const records = await this.GetRecordsByYearAndMonth(this.year, this.month);

    if (records) {
      this.calendarRecords = records;
      this.messageService.add(`CalendarRepo: Got calendar records for: ${this.year}-${this.month + 1}.`);
    }
    else {
      this.messageService.add(`CalendarRepo: Get calendar records failed for: ${this.year}-${this.month + 1}.`, 'error');
      this.calendarRecords = [];
    }
  }

  setTodaysDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const week = Math.ceil((firstOfMonth.getDay() + date.getDate()) / 7);
    const day = date.getDate();
    this.today = { 'year': year, 'month': month, 'week': week, 'day': day };
  }

  changeDay(nextOrPrevious: string) {
    const maxDay = this.calendarHelper.daysInMonthArray(this.year, this.month)[this.calendarHelper.daysInMonthArray(this.year, this.month).length - 1];
    if (nextOrPrevious === 'next' && ++this.day > maxDay) this.changeMonth('next');
    else if (nextOrPrevious === 'previous' && --this.day < 1) this.changeMonth('previous')
  }

  changeWeek(nextOrPrevious: string) {
    const maxWeek = this.calendarHelper.weeksInMonth(this.year, this.month);
    if (nextOrPrevious === 'next' && ++this.week > maxWeek) this.changeMonth('next');
    else if (nextOrPrevious === 'previous' && --this.week < 1) this.changeMonth('previous');
  }

  async changeMonth(nextOrPrevious: string) {
    const oneIndexedMonth = this.month + 1;
    const tempDate = new Date(`${this.year} ${oneIndexedMonth}`);

    if (nextOrPrevious === 'next') {
      tempDate.setMonth(this.month + 1);
      this.year = tempDate.getFullYear();
      this.month = tempDate.getMonth();
      this.week = 1;
      this.day = 1;
    }
    else if (nextOrPrevious === 'previous') {
      tempDate.setMonth(this.month - 1);
      this.year = tempDate.getFullYear();
      this.month = tempDate.getMonth();
      this.week = this.calendarHelper.weeksInMonth(this.year, this.month);
      this.day = this.calendarHelper.daysInMonth(this.year, this.month);
    }

    await this.getCalendarRecords();

    this.closeAddOrUpdateEventForm.next(true);
  }

  async updateRecords() {
    this.calendarRecords = [];
    await this.getCalendarRecords();
    this.day = 1;
    this.closeAddOrUpdateEventForm.next(true);
  }

  async changeToToday() {
    this.year = this.today.year;
    this.month = this.today.month;
    this.week = this.today.week;
    this.day = this.today.day;
    await this.getCalendarRecords();
  }

  isSelectedMonth(month: string) {
    return this.calendarHelper.monthNames()[this.month].toLowerCase() === month.toLowerCase();
  }

  isSelectedYear(year: number) {
    return this.year === year;
  }

  getDayNameLongForMonth(day: number) {
    return this.calendarHelper.getDayNameLongForMonth(this.year, this.month, day);
  }

  getDayNameShortForMonth(day: number): string {
    return this.calendarHelper.getDayNameShortForMonth(this.year, this.month, day);
  }

  filterRecordsByDay(day: number): CalendarRecord[] {
    return this.calendarHelper.getRecordsByDay(day, this.calendarRecords);
  }

  getDaysForWeekOutsideOfMonth(): Date[] {
    return this.calendarHelper.getDaysForWeekOutsideOfMonth(this.year, this.month, this.week);
  }

  getDaysForWeek(): Date[] {
    return this.calendarHelper.getDaysForWeek(this.year, this.month, this.week);
  }

  getRecordsGroupedByHourAndDayForWeek(): { hour: number; date: Date; records: CalendarRecord[]; }[] {
    return this.calendarHelper.getRecordsGroupedByHourAndDayForWeek(this.year, this.month, this.week, this.calendarRecords);
  }

  getEmptyRecordsGroupedByHourAndDayForWeek(): { hour: number; date: Date; }[] {
    return this.calendarHelper.getEmptyRecordsGroupedByHourAndDayForWeek(this.year, this.month, this.week, this.calendarRecords);
  }

  getEmptyHoursByDay(): any[] {
    return this.calendarHelper.getEmptyHoursByDay(this.day, this.calendarRecords);
  }

  getRecordsGroupedByHourForDay(): { hour: number, date: Date, records: CalendarRecord[] }[] {
    return this.calendarHelper.getRecordsGroupedByHourForDay(this.year, this.month, this.day, this.calendarRecords);
  }
}
