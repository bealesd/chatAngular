import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as uuid from 'uuid';

import { LoginHelper } from '../login/loginHelper';
import { CalendarService } from './../services/calendar.service';
import { MessageService } from '../services/message.service';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-calendar-main',
  templateUrl: './calendar-main.component.html',
  styleUrls: ['./calendar-main.component.css']
})
export class CalendarMainComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  addingEvent: boolean = false;
  updatingEvent: boolean = false;
  currentRecord: { what: string; hour: number; minute: number; day: number; month: number; year: number; id: string; };
  undoEnabled: boolean = false;
  lastGridRow: number;
  penultimateGridRow: number;
  lastCol: number;
  profileForm = this.fb.group({
    what: ['', Validators.required],
    hour: [0, [Validators.required, Validators.pattern("^(0[0-9]|[0-9]|1[0-9]|2[0-3])$")]],
    minute: [0, [Validators.required, Validators.pattern("^(0[0-9]|[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])$")]],
    month: [],
    year: [],
    day: [],
    id: []
  })
  year: number;
  zeroIndexedMonth: number;
  today: number;
  monthName: string;
  records: [] = [];
  daysEnum = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  };
  daysLongEnum = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };
  get weekdayNames(): string[] {
    return Object.keys(this.daysEnum);
  }
  monthsEnum = {
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11
  }

  get monthNames(): string[] {
    return Object.keys(this.monthsEnum);
  }
  get daysInMonth() {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    return new Date(this.year, this.zeroIndexedMonth + 1, 0).getDate();
  }
  get daysInMonthArray() {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    const days: number[] = [];
    for (let i = 1; i <= (this.daysInMonth); i++) days.push(i);
    return days;
  }
  get dayDataForMonth() {
    const dayData = [];

    let gridRow = 1;
    this.daysInMonthArray.forEach((dayNumber, index) => {
      const day = new Date(this.year, this.zeroIndexedMonth, dayNumber).getDay();
      if (index !== 0 && day === 0) gridRow++;

      const col = (day % 7);
      const gridCol = col + 1;
      const dayName = this.weekdayNames[col];
      this.lastCol = gridCol;

      dayData.push({ 'gridRow': gridRow, 'gridCol': gridCol, 'name': dayName, 'dayInMonthArrayIndex': index });
    });

    this.lastGridRow = gridRow;
    this.penultimateGridRow = gridRow - 1;

    return dayData;
  }

  constructor(
    private calendarService: CalendarService,
    private messageService: MessageService,
    private loginHelper: LoginHelper,
    private fb: FormBuilder,
    private menuService: MenuService
  ) {
    let date = new Date();
    this.year = date.getFullYear();
    this.zeroIndexedMonth = date.getMonth();
    this.today = date.getDate()
  }

  ngOnInit() {
    this.menuService.disableMenuItem('undo-click');

    if (!this.loginHelper.checkPersonSelected()) {
      this.loginHelper.setPerson();
    }

    this.calendarService.calendarRecords.subscribe(calendarRecords => {
      console.log(calendarRecords);
      if (calendarRecords.hasOwnProperty(`${this.year}-${this.zeroIndexedMonth}`))
        this.records = calendarRecords[`${this.year}-${this.zeroIndexedMonth}`].records;
      else
        this.records = [];
    });

    this.calendarService.getCalendarRecords(this.year, this.zeroIndexedMonth);

    this.subscriptions.push(
      this.profileForm.valueChanges.subscribe(() => {
        this.undoEnabled = this.checkEnableUndo();

        if (this.undoEnabled)
          this.menuService.enableMenuItem('undo-click', () => { this.undoChanges(); this.menuService.hideMenu(); });
        else
          this.menuService.disableMenuItem('undo-click');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.calendarService.calendarRecords.observers.forEach(element => { element.complete(); });
    this.calendarService.calendarRecords.next({});

    this.menuService.disableMenuItem('undo-click');
  }

  getDayName(dayNumber) {
    return Object.keys(this.daysEnum)[dayNumber];
  }

  getDayNameLong(dayNumber) {
    return Object.keys(this.daysLongEnum)[dayNumber];
  }

  getRecordsByDay(day) {
    const records = this.records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

  getDayNameForMonth(day) {
    const date = new Date(this.year, this.zeroIndexedMonth, day);
    return this.getDayName(date.getDay());
  }

  getDayNameLongForMonth(day) {
    const date = new Date(this.year, this.zeroIndexedMonth, day);
    return this.getDayNameLong(date.getDay());
  }

  changeMonth(isNextMonth: boolean) {
    let zeroIndexedMonth = this.zeroIndexedMonth;
    let oneIndexedMonth = this.zeroIndexedMonth + 1;

    let year = this.year;

    let tempDate = new Date(`${year} ${oneIndexedMonth}`);

    if (isNextMonth) tempDate.setMonth(zeroIndexedMonth + 1);
    else tempDate.setMonth(zeroIndexedMonth - 1);

    this.year = tempDate.getFullYear();
    this.zeroIndexedMonth = tempDate.getMonth();

    this.calendarService.calendarRecords.next({});
    this.calendarService.getCalendarRecords(this.year, this.zeroIndexedMonth);

    this.closeAddOrUpdateEventForm();
  }

  checkEnableUndo() {
    return this.updatingEvent
      && (this.profileForm.value.hour !== this.currentRecord.hour
        || this.profileForm.value.minute !== this.currentRecord.minute
        || this.profileForm.value.what !== this.currentRecord.what);
  }

  undoChanges() {
    if (window.confirm('Are you sure you want to undo changes?')) {
      this.profileForm.patchValue(this.currentRecord);
      this.undoEnabled = false;
    }
  }

  openAddEventForm(evt, dayData) {
    this.undoEnabled = false;
    this.addingEvent = true;

    this.profileForm.patchValue({
      what: '',
      hour: 0,
      minute: 0,
      day: this.daysInMonthArray[dayData.dayInMonthArrayIndex],
      month: this.zeroIndexedMonth,
      year: this.year,
      id: uuid()
    });
  }

  openUpdateEventForm(evt, record) {
    this.undoEnabled = false;
    this.updatingEvent = true

    this.currentRecord = {
      what: record.what,
      hour: record.hour,
      minute: record.minute,
      day: record.day,
      month: this.zeroIndexedMonth,
      year: this.year,
      id: record.id
    };

    this.profileForm.patchValue(this.currentRecord);
  }

  addEventClick() {
    this.postEvent();
  }

  updateEventClick() {
    if (!this.undoEnabled) alert('No changes!');
    else this.postEvent();
  }

  postEvent() {
    const record = {
      'what': this.profileForm.value.what,
      'day': this.profileForm.value.day,
      'hour': this.profileForm.value.hour,
      'minute': this.profileForm.value.minute,
      'id': this.profileForm.value.id
    }
    this.calendarService.postCalendarRecord(this.profileForm.value.year, this.profileForm.value.month, record);
    this.closeAddOrUpdateEventForm();
  }

  deleteEvent() {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      this.calendarService.deleteCalendarRecord(this.profileForm.value.year, this.profileForm.value.month, this.profileForm.value.id);
      this.closeAddOrUpdateEventForm();
    }
  }

  closeAddOrUpdateEventForm() {
    this.menuService.disableMenuItem('undo-click');
    this.addingEvent = false;
    this.updatingEvent = false;
    this.undoEnabled = false;
  }

  closeClickAddEventForm() {
    if (!this.profileForm.valid)
      this.addingEvent = false;
    else if (window.confirm('Are you sure you want to discard changes?'))
      this.addingEvent = false;
  }

  closeClickUpdateEventForm() {
    this.menuService.disableMenuItem('undo-click');
    if (!this.undoEnabled)
      this.updatingEvent = false;
    else if (window.confirm('Are you sure you want to discard changes?'))
      this.updatingEvent = false;
  }

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

  private compareByTime(a, b) {
    const is_hour_a_before_b = a.hour < b.hour ? true : (a.hour === b.hour ? null : false);
    const is_minute_a_before_b = a.minute < b.minute ? true : (a.minute === b.minute ? null : false);

    const is_a_before_b = is_hour_a_before_b || (is_hour_a_before_b === null && is_minute_a_before_b);
    const is_a_same_as_b = is_hour_a_before_b === null && is_minute_a_before_b === null;

    return is_a_before_b ? -1 : (is_a_same_as_b ? 1 : 0);
  }
}
