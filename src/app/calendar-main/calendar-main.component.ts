import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private calendarRepo: CalendarRepo,public calendarService: CalendarService, public menuService: MenuService) { }

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

      this.calendarRepo.getCalendarRecords(this.calendarService.year, this.calendarService.zeroIndexedMonth);
  }

  ngOnDestroy() {
    this.menuService.disableMenuItem('day-click');
    this.menuService.disableMenuItem('week-click');
    this.menuService.disableMenuItem('month-click');
  }
}
