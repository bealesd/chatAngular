import { Component, OnInit, OnDestroy } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CalendarRepo } from '../services/calendar.repo';
import { CalendarService } from '../services/calendar.service';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-calendar-main',
  templateUrl: './calendar-main.component.html',
  styleUrls: ['./calendar-main.component.css']
})
export class CalendarMainComponent implements OnInit, OnDestroy {
  monthOrWeek: string = 'month';
  calendarViews = ['Month', 'Week', 'Day'];
  title: string;

  get width() { return window.innerWidth; }

  constructor(private calendarRepo: CalendarRepo, public calendarService: CalendarService, public menuService: MenuService) {
    fromEvent(window, 'resize').pipe(debounceTime(1000)).subscribe(() => { this.width; });
  }

  ngOnInit() {
    this.menuService.enableMenuItem('day-click',
      () => {
        this.menuService.hideMenu();
        this.monthOrWeek = 'day';
      });

    this.menuService.enableMenuItem('week-click',
      () => {
        this.menuService.hideMenu();
        this.monthOrWeek = 'week';
      });

    this.menuService.enableMenuItem('month-click',
      () => {
        this.menuService.hideMenu();
        this.monthOrWeek = 'month';
      });

    this.calendarRepo.getCalendarRecords(parseInt(`${this.calendarService.year}`), parseInt(`${this.calendarService.zeroIndexedMonth}`));
  }

  ngOnDestroy() {
    this.menuService.disableMenuItem('day-click');
    this.menuService.disableMenuItem('week-click');
    this.menuService.disableMenuItem('month-click');
  }

  updateCalendarView(value: string) {
    if (this.calendarViews.includes(value))
      this.monthOrWeek = value.toLowerCase();
    else
      console.error(`Invalid calendar view selected in dropdown: '${value}'.`);
  }

  updateMonth(value: number) {
    this.calendarService.zeroIndexedMonth = parseInt(`${value}`);
    this.calendarService.updateMonthRecords();
  }

  getSelectedMonth(month: string) {
    if(this.calendarService.monthNames[parseInt(`${this.calendarService.zeroIndexedMonth}`)].toLowerCase() === month.toLowerCase()){
      console.log(`selected ${month}`);
      return true;
    }

  }
}
