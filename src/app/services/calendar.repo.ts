import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GitHubMetaData } from '../gitHubMetaData'
import { CryptoService } from './crypto.service';
import { RestHelper } from '../helpers/rest-helper';

@Injectable({
  providedIn: 'root'
})
export class CalendarRepo {
  private baseMessagesUrl = 'https://api.github.com/repos/bealesd/calendarStore/contents';

  constructor(
    private cryptoService: CryptoService,
    private http: HttpClient,
    private restHelper: RestHelper) {
  }

  options = (): { headers: HttpHeaders } => {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cryptoService.getToken()}`
      })
    }
  }

  getCalendarListings = (): Observable<GitHubMetaData[]> => {
    return this.http.get<GitHubMetaData[]>(this.baseMessagesUrl, this.options());
  }

  getCalendarRecordsForMonth(year: number, month: number): Observable<any> {
    const getUrl = `${this.baseMessagesUrl}/${year}-${month}.json`;
    return this.http.get<[]>(this.restHelper.removeUrlParams(getUrl), this.options());
  }

  postCalendarRecords(year, month, calendarRecords: any, sha): Observable<any> {
    const postUrl = `${this.baseMessagesUrl}/${year}-${month}.json`;

    const rawCommitBody = JSON.stringify({
      "message": `Api commit by calendar record wesbite at ${new Date().toLocaleString()}`,
      "content": btoa(btoa(JSON.stringify(calendarRecords))),
      'sha': sha
    });

    return this.http.put<{ content: GitHubMetaData }>(postUrl, rawCommitBody, this.options());
  }
}
