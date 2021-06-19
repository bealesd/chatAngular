import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarRecordRest } from './../models/calendar-record-rest.model';
import { Injectable } from '@angular/core';

import { MessageService } from '../services/message.service';
import { FileApi, FileApiFactory } from './file-api';
import { ItemMetadata } from '../models/item-models';

@Injectable({
  providedIn: 'root'
})
export class CalendarRepo {
  public calendarRecordRest: CalendarRecordRest = new CalendarRecordRest();
  fileApi: FileApi;
  calendarRecordsMetadata: ItemMetadata[] = [];

  constructor(
    private messageService: MessageService,
    private fileApiFactory: FileApiFactory) {
    this.fileApi = this.fileApiFactory.create();
    this.fileApi.dir = '/calendarStore';
  }

  async getRecordsFile(name: string): Promise<ItemMetadata> {
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

    const metadata = this.calendarRecordsMetadata.find((metadata) => metadata.name === name);
    const isNewFile = metadata ? false : true 

    const isUpdate = this.calendarRecordRest.records.find(r => r.id === record.id) !== undefined;

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

    if (isNewFile) {
      let result = await this.fileApi.newFileAsync(name, this.calendarRecordRest.toJsonString());
      if (!result)
        this.messageService.add(`CalendarRepo: posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'error');
      else
        this.messageService.add(` • Posted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
    }
    else {
        let result = await this.fileApi.editFileAsync(metadata.key, this.calendarRecordRest.toJsonString());
        if (!result)
          this.messageService.add(`CalendarRepo: posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'error');
        else
          this.messageService.add(` • Posted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
    }
  }

  async getAllRecords(): Promise<boolean> {
    this.messageService.add(`CalendarRepo: Getting metadata for all records.`);
    const calendarRecordsMetadata = await this.fileApi.listFilesAndFoldersAsync();
    if (!calendarRecordsMetadata) {
      this.messageService.add('CalendarRepo: Getting metadata for all records.', 'error');
      return false;
    }
    else {
      this.calendarRecordsMetadata = [];
      calendarRecordsMetadata.forEach((value: ItemMetadata) => {
        let metadata = new ItemMetadata(value.name, value.path, value.sha, value.size, value.git_url, value.type, value.url);
        this.calendarRecordsMetadata.push(metadata);
      });
      this.messageService.add(`CalendarRepo: Got metadata for all records.`);
      return true
    }
  }

  async getCalendarRecords(year: number, month: number): Promise<void> {
    this.messageService.add(`CalendarRepo: Getting calendar record for ${year}-${month + 1}.`);
    this.calendarRecordRest.year = year;
    this.calendarRecordRest.month = month;
    this.calendarRecordRest.records = [];

    const name = `${year}-${month}.json`;
    const metadata = this.calendarRecordsMetadata.find((metadata) => metadata.name === name);
    let content;
    if (metadata !== null && metadata !== undefined)
      content = await this.fileApi.getFileAsync(metadata.git_url);

    if (!content || content === '') {
      this.calendarRecordRest.records = [];
      this.messageService.add(`CalendarRepo: getting calendar records for ${year}-${month + 1}.`, 'error');
    }
    else {
      JSON.parse(content).forEach(rec => {
        this.calendarRecordRest.records.push(new CalendarRecord(rec.id, rec.what, rec.day, rec.hour, rec.minute));
      });

      this.messageService.add(`CalendarRepo: Got ${this.calendarRecordRest.records.length} calendar records for ${year}-${month + 1}.`);
    }
  }

}
