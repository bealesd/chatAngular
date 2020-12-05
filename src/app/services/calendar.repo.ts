import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarRecordRest } from './../models/calendar-record-rest.model';
import { Injectable } from '@angular/core';

import { MessageService } from '../services/message.service';
import { FileApi, FileApiFactory } from './file-api';

@Injectable({
  providedIn: 'root'
})
export class CalendarRepo {
  public calendarRecordRest: CalendarRecordRest = new CalendarRecordRest();
  fileApi: FileApi;

  constructor(
    private messageService: MessageService,
    private fileApiFactory: FileApiFactory) {
    this.fileApi = this.fileApiFactory.create();
    this.fileApi.dir = '/calendarStore';
  }

  async deleteCalendarRecord(id: string): Promise<void> {
    this.messageService.add(`CalendarRepo: Deleting calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`);
    const deepCopyRecords = JSON.parse(JSON.stringify(this.calendarRecordRest.records));
    const recordsToKeep = this.calendarRecordRest.records.filter(r => r.id !== id);
    this.calendarRecordRest.records = recordsToKeep;
    const name = `${this.calendarRecordRest.year}-${this.calendarRecordRest.month}.json`;

    const result = await this.fileApi.editFileAsync(name, btoa(this.calendarRecordRest.toJsonString()));
    if (!result) {
      this.calendarRecordRest.records = deepCopyRecords;
      this.messageService.add(`CalendarRepo: Deleted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`, 'error');
    }
    else 
      this.messageService.add(`CalendarRepo: Deleted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`);
  }

  async postCalendarRecord(record: CalendarRecord): Promise<void> {
    const isUpdate = this.calendarRecordRest.records.find(r => r.id === record.id) !== undefined;
    let recordTopdate;
    if (isUpdate) {
      recordTopdate = this.calendarRecordRest.records.find(r => r.id === record.id);
      recordTopdate.what = record.what;
      recordTopdate.day = record.day;
      recordTopdate.hour = record.hour;
      recordTopdate.minute = record.minute;
    }
    else
      this.calendarRecordRest.records.push(record);

    this.messageService.add(`Posting calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);

    const name = `${this.calendarRecordRest.year}-${this.calendarRecordRest.month}.json`;
    if (isUpdate) {
      let result = await this.fileApi.editFileAsync(name, btoa(this.calendarRecordRest.toJsonString()));
      if (!result) 
        this.messageService.add(`CalendarRepo: posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'error');
      else
        this.messageService.add(` • Posted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
    }
    else {
      let result = await this.fileApi.newFileAsync(name, btoa(this.calendarRecordRest.toJsonString()));
      if (!result) 
        this.messageService.add(`CalendarRepo: posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'error');
      else 
        this.messageService.add(` • Posted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
    }
  }

  async getCalendarRecords(year: number, month: number): Promise<void> {
    this.messageService.add(`CalendarRepo: Getting calendar record for ${year}-${month + 1}.`);
    this.calendarRecordRest.year = year;
    this.calendarRecordRest.month = month;
    this.calendarRecordRest.records = [];

    const calendarRecordGitHub = await this.fileApi.getFileAsync(`${year}-${month}.json`);

    if (!calendarRecordGitHub) {
      this.calendarRecordRest.records = [];
      this.messageService.add('CalendarRepo: getting calendar records', 'error');
    }
    else {
      JSON.parse(atob(calendarRecordGitHub)).forEach(rec => {
        this.calendarRecordRest.records.push(new CalendarRecord(rec.id, rec.what, rec.day, rec.hour, rec.minute));
      });

      this.messageService.add(`CalendarRepo: Got ${this.calendarRecordRest.records.length} calendar records.`);
    }
  }

}
