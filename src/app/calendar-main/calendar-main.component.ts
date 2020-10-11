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

  //"message":"work","day":"14","hour":"7","minute":"30","id"
  profileForm = this.fb.group({
    what: ['', Validators.required],
    time: this.fb.group({
      hour: [],
      minute: []
    }),
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

  daysEnum = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6
  };
  calendarRecords: any;

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
      this.calendarRecords = calendarRecords;
      console.log(this.calendarRecords);
      //TODO, draw events and enable updting of events
    });

    this.chatService.getCalendarRecords(this.year, this.month);
  }

  ngOnInit(): void {
  }

  get dayDataForMonth() {
    let dayData = [];

    let gridRow = 1;
    this.daysInMonthArray.forEach((dayNumber, index) => {
      const day = new Date(this.year, this.month, dayNumber).getDay();
      if (index !== 0 && day === 0) gridRow++;

      const col = (day % 7);
      const gridCol = col + 1;
      const dayName = this.weekdayNames[col];

      dayData.push({ 'gridRow': gridRow, 'gridCol': gridCol, 'name': dayName, 'dayInMonthArrayIndex': index });
    });
    return dayData;
  }

  addEvent(evt, dayData) {
    this.addingEvent = true;

    this.profileForm.patchValue({
      what: '',
      time: {
        hour: 7,
        minute: 30
      },
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
      'hour': this.profileForm.value.time.hour,
      'minute': this.profileForm.value.time.minute,
      'id': this.profileForm.value.id
    }
    this.chatService.postCalendarRecord(this.profileForm.value.year, this.profileForm.value.month, record)
  }

  updateProfile() {
    this.profileForm.patchValue({
      what: 'going swimming',
      time: {
        hour: 7,
        minute: 30
      },
      month: this.month,
      year: this.year
    });
  }

  getDayNameForMonth(day) {
    const date = new Date(this.year, this.month, day);
    return this.getDayName(date.getDay());
  }

}
