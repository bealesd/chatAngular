import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarRecordRest } from './../models/calendar-record-rest.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GitHubMetaData } from '../models/gitHubMetaData'
import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from '../services/message.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/calendarStore/contents';
  public calendarRecordRest: CalendarRecordRest = new CalendarRecordRest();

  constructor(
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
  }

  getCalendarRecordsForMonthRest(year: number, month: number): Observable<any> {
    const getUrl = `${this.baseMessagesUrl}/${year}-${month}.json`;
    return this.http.get<[]>(this.restHelper.removeUrlParams(getUrl), this.restHelper.options());
  }

  postCalendarRecordsRest(calendarRecords: CalendarRecordRest): Observable<any> {
    const postUrl = `${this.baseMessagesUrl}/${calendarRecords.year}-${calendarRecords.month}.json`;

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by calendar record wesbite at ${new Date().toLocaleString()}`,
      "content": btoa(btoa(calendarRecords.toJsonString())),
      'sha': calendarRecords.sha
    });

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.restHelper.options());
  }

  deleteCalendarRecord(id: string): void {
    this.messageService.add(`Deleting calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`);

    const recordsToKeep = this.calendarRecordRest.records.filter(r => r.id !== id);
    const deepCopyRecords = JSON.parse(JSON.stringify(recordsToKeep));
    this.calendarRecordRest.records = recordsToKeep;

    this.postCalendarRecordsRest(this.calendarRecordRest).subscribe(
      {
        next: (calendarRecordsResult) => {
          this.calendarRecordRest.sha = (<any>calendarRecordsResult).content.sha;
          this.messageService.add(` • Deleted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `deleting calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}, ${id}.`, 'CalendarRepo');
          this.calendarRecordRest.records = deepCopyRecords;
        }
      }
    );
  }

  postCalendarRecord(record: CalendarRecord): void {
    const isUpdate = this.calendarRecordRest.records.find(r => r.id === record.id) !== undefined;
    if (isUpdate) {
      let recordTopdate = this.calendarRecordRest.records.find(r => r.id === record.id);
      recordTopdate.what = record.what;
      recordTopdate.day = record.day;
      recordTopdate.hour = record.hour;
      recordTopdate.minute = record.minute;
    }
    else
      this.calendarRecordRest.records.push(record);

    this.messageService.add(`Posting calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
    this.postCalendarRecordsRest(this.calendarRecordRest).subscribe(
      {
        next: (calendarRecordsResult: any[]) => {
          this.calendarRecordRest.sha = (<any>calendarRecordsResult).content.sha;

          this.messageService.add(` • Posted calendar record for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `posting calendar records for ${this.calendarRecordRest.year}-${this.calendarRecordRest.month + 1}. Record: ${JSON.stringify(record)}.`, 'CalendarRepo');
        }
      }
    );
  }

  getCalendarRecords(year: number, month: number): void {
    this.messageService.add(`Getting calendar record for ${year}-${month + 1}.`);
    this.calendarRecordRest.year = year;
    this.calendarRecordRest.month = month;
    this.calendarRecordRest.records = [];

    this.getCalendarRecordsForMonthRest(year, month).subscribe(
      {
        next: (calendarRecordGitHub: any) => {
          JSON.parse(atob(atob(calendarRecordGitHub.content))).forEach(rec => {
            this.calendarRecordRest.records.push(new CalendarRecord(rec.id, rec.what, rec.day, rec.hour, rec.minute));
          });

          this.calendarRecordRest.sha = calendarRecordGitHub.sha;

          this.messageService.add(` • Got ${this.calendarRecordRest.records.length} calendar records.`);
        },
        error: (err: any) => {
          this.calendarRecordRest.records = [];

          this.restHelper.errorMessageHandler(err, 'getting calendar records', 'CalendarRepo');
        }
      }
    );
  }

}
