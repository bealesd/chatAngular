import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginHelper } from '../login/loginHelper';
import { ChatService } from '../services/chat.service';
import { MessageService } from '../services/message.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-calendar-main',
  templateUrl: './calendar-main.component.html',
  styleUrls: ['./calendar-main.component.css']
})
export class CalendarMainComponent implements OnInit {
  addingEvent: boolean = false;

  profileForm = this.fb.group({
    what: ['', Validators.required],
    hour: ['', [Validators.required, Validators.pattern("^(0[0-9]|[0-9]|1[0-9]|2[0-3])$")]],
    minute: ['', [Validators.required, Validators.pattern("^(0[0-9]|[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])$")]],
    month: [],
    year: [],
    day: [],
    id: []
  })

  year: number;
  // 0 indexed
  month: number;
  today: number;
  monthName: string;
  records: [] = [];

  daysEnum = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6
  };
  maxGridRow: number;

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
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  get daysInMonthArray() {
    // day is 0 - the last day of previous month. Thus we add 1 to previous month. getDate() gives the day number of date.
    const days: number[] = [];
    for (let i = 1; i <= (this.daysInMonth); i++) days.push(i);
    return days;
  }

  getDayName(dayNumber) {
    return Object.keys(this.daysEnum)[dayNumber];
  }

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private loginHelper: LoginHelper,
    private fb: FormBuilder
  ) {
    let date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.today = date.getDate()
    this.monthName = this.monthNames[this.month];

    this.chatService.calendarRecords.subscribe(calendarRecords => {
      console.log(calendarRecords);
      if (calendarRecords.hasOwnProperty(`${this.year}-${this.month}`)) {
        this.records = calendarRecords[`${this.year}-${this.month}`].records;
      }
      else {
        this.records = [];
      }
    });

    this.chatService.getCalendarRecords(this.year, this.month);
  }

  ngOnInit(): void {
  }

  getRecordsByDay(day) {
    const records = this.records.filter(r => r['day'] === day);
    records.sort(this.compareByTime);
    return records;
  }

  get dayDataForMonth() {
    const dayData = [];

    let gridRow = 1;
    this.daysInMonthArray.forEach((dayNumber, index) => {
      const day = new Date(this.year, this.month, dayNumber).getDay();
      if (index !== 0 && day === 0) gridRow++;

      const col = (day % 7);
      const gridCol = col + 1;
      const dayName = this.weekdayNames[col];

      dayData.push({ 'gridRow': gridRow, 'gridCol': gridCol, 'name': dayName, 'dayInMonthArrayIndex': index });
    });

    this.maxGridRow = gridRow;
    return dayData;
  }

  addEvent(evt, dayData) {
    this.addingEvent = true;

    this.profileForm.patchValue({
      what: '',
      hour: '',
      minute: '',
      day: this.daysInMonthArray[dayData.dayInMonthArrayIndex],
      month: this.month,
      year: this.year,
      id: uuid()
    });

  }

  onSubmit() {
    const record = {
      'what': this.profileForm.value.what,
      'day': this.profileForm.value.day,
      'hour': this.profileForm.value.hour,
      'minute': this.profileForm.value.minute,
      'id': this.profileForm.value.id
    }
    this.chatService.postCalendarRecord(this.profileForm.value.year, this.profileForm.value.month, record);
    this.closeAddEventForm();
  }

  updateProfile() {
    this.profileForm.patchValue({
      what: 'going swimming',
      hour: 7,
      minute: 30,
      month: this.month,
      year: this.year
    });
  }

  getDayNameForMonth(day) {
    const date = new Date(this.year, this.month, day);
    return this.getDayName(date.getDay());
  }

  closeAddEventForm() {
    this.addingEvent = false;
  }

  private padToTwo(value: number): string {
    return value <= 99 ? `0${value}`.slice(-2) : `${value}`;
  }

  private compareByTime(a, b) {
    let is_hour_a_before_b = a.hour < b.hour ? true : (a.hour === b.hour ? null : false);
    let is_minute_a_before_b = a.minute < b.minute ? true : (a.minute === b.minute ? null : false);

    let is_a_before_b = is_hour_a_before_b || (is_hour_a_before_b === null && is_minute_a_before_b);
    let is_a_same_as_b = is_hour_a_before_b === null && is_minute_a_before_b === null;

    return is_a_before_b ? -1 : (is_a_same_as_b ? 1 : 0);
  }
}
