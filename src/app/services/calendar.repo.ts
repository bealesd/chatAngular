import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarRecordRest } from './../models/calendar-record-rest.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { GitHubMetaData } from '../gitHubMetaData'
import { CryptoService } from './crypto.service';
import { RestHelper } from '../helpers/rest-helper';
import { MessageService } from '../services/message.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/calendarStore/contents';
  public calendarRecordRest: BehaviorSubject<CalendarRecordRest> = new BehaviorSubject<CalendarRecordRest>(new CalendarRecordRest());

  constructor(
    private cryptoService: CryptoService,
    private http: HttpClient,
    private restHelper: RestHelper,
    private messageService: MessageService) {
  }

  options = (): { headers: HttpHeaders } => {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cryptoService.getToken()}`
      })
    }
  }

  getCalendarListingsRest = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options());
  }

  getCalendarRecordsForMonthRest(year: number, month: number): Observable<any> {
    const getUrl = `${this.baseMessagesUrl}/${year}-${month}.json`;
    return this.http.get<[]>(this.restHelper.removeUrlParams(getUrl), this.options());
  }

  postCalendarRecordsRest(calendarRecords: CalendarRecordRest): Observable<any> {
    const postUrl = `${this.baseMessagesUrl}/${calendarRecords.year}-${calendarRecords.month}.json`;

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by calendar record wesbite at ${new Date().toLocaleString()}`,
      "content": btoa(btoa(calendarRecords.toJsonString())),
      'sha': calendarRecords.sha
    });

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.options());
  }

  deleteCalendarRecord(id: string): void {
    const calendarRecords = this.calendarRecordRest.getValue();
    this.messageService.add(`Deleting calendar record for ${calendarRecords.year}-${calendarRecords.month + 1}, ${id}.`);

    const recordsToKeep = calendarRecords.records.filter(r => r.id !== id);
    const deepCopyRecords = JSON.parse(JSON.stringify(recordsToKeep));
    calendarRecords.records = recordsToKeep;

    this.postCalendarRecordsRest(calendarRecords).subscribe(
      {
        next: (calendarRecordsResult) => {
          calendarRecords.sha = (<any>calendarRecordsResult).content.sha;
          this.messageService.add(` • Deleted calendar record for ${calendarRecords.year}-${calendarRecords.month + 1}, ${id}.`);
          this.calendarRecordRest.next(calendarRecords);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `deleting calendar record for ${calendarRecords.year}-${calendarRecords.month + 1}, ${id}.`);
          calendarRecords.records = deepCopyRecords;
        }
      }
    );
  }

  postCalendarRecord(record: CalendarRecord): void {
    const calendarRecords = this.calendarRecordRest.getValue();

    const isUpdate = calendarRecords.records.find(r => r.id === record.id) !== undefined;
    if (isUpdate) {
      calendarRecords.records.forEach((r) => {
        if (r.id === record.id) {
          r.what = record.what;
          r.day = record.day;
          r.hour = record.hour;
          r.minute = record.minute;
        }
      });
    }
    else
      calendarRecords.records.push(record);

    this.messageService.add(`Posting calendar record for ${calendarRecords.year}-${calendarRecords.month + 1}.`);
    this.postCalendarRecordsRest(calendarRecords).subscribe(
      {
        next: (calendarRecordsResult: any[]) => {
          calendarRecords.sha = (<any>calendarRecordsResult).content.sha;

          this.messageService.add(` • Posted calendar record for ${calendarRecords.year}-${calendarRecords.month + 1}.`);
          this.calendarRecordRest.next(calendarRecords);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, `posting calendar records for ${calendarRecords.year}-${calendarRecords.month + 1}. Record: ${JSON.stringify(record)}.`);
        }
      }
    );
  }

  getCalendarRecords(year: number, month: number): void {
    this.messageService.add(`Getting calendar record for ${year}-${month + 1}.`);
    const calendarRecords = this.calendarRecordRest.getValue();
    calendarRecords.year = year;
    calendarRecords.month = month;

    this.getCalendarRecordsForMonthRest(year, month).subscribe(
      {
        next: (calendarRecordGitHub: any) => {
          JSON.parse(atob(atob(calendarRecordGitHub.content))).forEach(rec => {;
              calendarRecords.records.push(new CalendarRecord(rec.id, rec.what, rec.day, rec.hour, rec.minute));
          });
          console.log(calendarRecords.records)
          calendarRecords.sha = calendarRecordGitHub.sha;

          this.calendarRecordRest.next(calendarRecords);
          this.messageService.add(` • Got ${calendarRecords.records.length} calendar records.`);
        },
        error: (err: any) => {
          this.restHelper.errorMessageHandler(err, 'getting calendar records');

          calendarRecords.records = [];
          this.calendarRecordRest.next(calendarRecords);
        }
      }
    );
  }
}
