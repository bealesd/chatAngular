import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GitHubMetaData } from './../gitHubMetaData';
import { MessageService } from '../services/message.service';
import { CalendarRepo } from './calendar.repo'

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  public calendarRecords = new BehaviorSubject<any>({});
  public loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private messageService: MessageService, private calendarRepo: CalendarRepo) {
  }

  deleteCalendarRecord(year, month, id): void {
    const calendarRecords = this.calendarRecords.getValue();

    let calendarRecordsForMonth = calendarRecords[`${year}-${month}`]
    calendarRecordsForMonth.records = calendarRecordsForMonth.records.filter(r => r.id !== id);

    this.calendarRepo.postCalendarRecords(year, month, calendarRecordsForMonth.records, calendarRecordsForMonth.sha).subscribe(
      {
        next: (calendarRecordsResult: any[]) => {
          const sha = (<any>calendarRecordsResult).content.sha;
          calendarRecordsForMonth.sha = sha;

          console.log(calendarRecords);
          this.calendarRecords.next(calendarRecords);

        },
        error: (data: any) => {
          console.log(data)
        }
      }
    );
  }

  postCalendarRecord(year, month, record): void {
    const calendarRecords = this.calendarRecords.getValue();

    let calendarRecordsForMonth;
    if (calendarRecords.hasOwnProperty(`${year}-${month}`))
      calendarRecordsForMonth = calendarRecords[`${year}-${month}`]
    else
      calendarRecordsForMonth = { 'records': [], 'sha': '' };

    const isUpdate = calendarRecordsForMonth.records.find(r => r.id === record.id) !== undefined;
    if (isUpdate) {
      calendarRecordsForMonth.records.forEach((r) => {
        if (r.id === record.id) {
          r.what = record.what;
          r.month = record.month;
          r.day = record.day;
          r.hour = record.hour;
          r.minute = record.minute;
        }
      });
    }
    else
      calendarRecordsForMonth.records.push(record);

    this.messageService.add(`Posting calendar record for ${year}-${month + 1}.`);
    this.calendarRepo.postCalendarRecords(year, month, calendarRecordsForMonth.records, calendarRecordsForMonth.sha).subscribe(
      {
        next: (calendarRecordsResult: any[]) => {
          const sha = (<any>calendarRecordsResult).content.sha;
          calendarRecordsForMonth.sha = sha;

          this.messageService.add(`Posted calendar record for ${year}-${month + 1}.`);
          this.calendarRecords.next(calendarRecords);

        },
        error: (data: any) => {
          this.messageService.add(`Could not post calendar record for ${year}-${month + 1}. Record: ${JSON.stringify(record)}.`);
          console.log(data)
        }
      }
    );
  }

  getCalendarRecords(year, month): void {
    this.messageService.add(`Getting calendar record for ${year}-${month + 1}.`);
    const calendarRecords = this.calendarRecords.getValue()
    this.calendarRepo.getCalendarRecordsForMonth(year, month).subscribe(
      {
        next: (calendarRecord: any) => {
          calendarRecords[`${year}-${month}`] = {
            'sha': calendarRecord.sha,
            'records': JSON.parse(atob(atob(calendarRecord.content)))
          }
          this.calendarRecords.next(calendarRecords);
          this.messageService.add(`Got ${(<any>Object.values(calendarRecords)[0]).records.length} calendar records.`);
        },
        error: (err: any) => {
          if (err.status === 404)
            this.messageService.add(`No calendar records.`);
          else if (err.status === 401) {
            this.messageService.add(`Could not get calendar records. Authentication error, 401.`);
            alert('Authentication error. You may need to login.');
          }
          else {
            this.messageService.add(`Could not get calendar records.`);
            console.error(err);
          }


          calendarRecords[`${year}-${month}`] = { 'records': [], 'sha': '' };
          this.calendarRecords.next(calendarRecords);
        }
      }
    );
  }

}
