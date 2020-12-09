import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarRecordRest } from './../models/calendar-record-rest.model';
import { Injectable } from '@angular/core';

import { MessageService } from '../services/message.service';
import { FileApi, FileApiFactory } from './file-api';
import { NotepadMetadata } from '../models/notepad-models';

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

  async getRecordsFile(name: string): Promise<NotepadMetadata> {
    const files = await this.fileApi.listFilesAndFoldersAsync();
    if (files === [] || files === null) {
      this.messageService.add(`CalendarRepo: Could not find any files.`, 'error');
      return null;
    }

    const file = files.find((file) => file.name === name);
    if (file === null || file === undefined) {
      this.messageService.add(`CalendarRepo: Could not find any file with name: ${name}.`, 'error');
      return null;
    }

    return file;
  }

  async deleteCalendarRecord(id: string): Promise<void> {
    this.messageService.add(`CalendarRepo: Deleting calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`);
    const deepCopyRecords = JSON.parse(JSON.stringify(this.calendarRecordRest.records));
    const recordsToKeep = this.calendarRecordRest.records.filter(r => r.id !== id);
    this.calendarRecordRest.records = recordsToKeep;


    const name = `${this.calendarRecordRest.year}-${this.calendarRecordRest.month}.json`;

    const file = await this.getRecordsFile(name);
    if (file === null) {
      this.calendarRecordRest.records = deepCopyRecords;
      this.messageService.add(`CalendarRepo: Deleted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`, 'error');
      return;
    }

    const result = await this.fileApi.editFileAsync(file.key, this.calendarRecordRest.toJsonString());
    if (!result) {
      this.calendarRecordRest.records = deepCopyRecords;
      this.messageService.add(`CalendarRepo: Deleted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`, 'error');
    }
    else
      this.messageService.add(`CalendarRepo: Deleted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`);
  }

  async postCalendarRecord(record: CalendarRecord): Promise<void> {
    // TODO split into 2 functions, update and new
    const name = `${this.calendarRecordRest.year}-${this.calendarRecordRest.month}.json`;
    const file = await this.getRecordsFile(name);
    const isNewFile = file === null;

    const isUpdate = this.calendarRecordRest.records.find(r => r.id === record.id) !== undefined;
    if (isNewFile && isUpdate) {
      this.messageService.add(`CalendarRepo: posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'error');
      return;
    }

    let recordTopdate: CalendarRecord;
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

    if (!isNewFile) {
      if (isUpdate) {
        let result = await this.fileApi.editFileAsync(file.key, this.calendarRecordRest.toJsonString());
        if (!result)
          this.messageService.add(`CalendarRepo: posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'error');
        else
          this.messageService.add(` • Posted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
      }
      else {
        let result = await this.fileApi.editFileAsync(file.key, this.calendarRecordRest.toJsonString());
        if (!result)
          this.messageService.add(`CalendarRepo: posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'error');
        else
          this.messageService.add(` • Posted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
      }
    }

    if (isNewFile) {
      let result = await this.fileApi.newFileAsync(name, this.calendarRecordRest.toJsonString());
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


    const name = `${year}-${month}.json`;
    const file = await this.getRecordsFile(name);
    if (file === null) {
      this.messageService.add(`CalendarRepo: getting calendar records for ${year}-${month + 1}.`, 'error');
      return;
    }
    const calendarRecordGitHub = await this.fileApi.getFileAsync(file.key);

    if (!calendarRecordGitHub) {
      this.calendarRecordRest.records = [];
      this.messageService.add(`CalendarRepo: getting calendar records for ${year}-${month + 1}.`, 'error');
    }
    else {
      JSON.parse(calendarRecordGitHub).forEach(rec => {
        this.calendarRecordRest.records.push(new CalendarRecord(rec.id, rec.what, rec.day, rec.hour, rec.minute));
      });

      this.messageService.add(`CalendarRepo: Got ${this.calendarRecordRest.records.length} calendar records for ${year}-${month + 1}.`);
    }
  }

}
