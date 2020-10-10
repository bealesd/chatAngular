import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar-main',
  templateUrl: './calendar-main.component.html',
  styleUrls: ['./calendar-main.component.css']
})
export class CalendarMainComponent implements OnInit {
  year: number;
  // 0 indexed
  month: number;
  day: number;
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

  constructor() {
    let date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.day = date.getDate()
    this.monthName = this.monthNames[this.month];

    console.log(this.dayDataForMonth);
  }

  ngOnInit(): void {
  }

  get dayDataForMonth() {
    let dayNames = [];
    this.daysInMonthArray.forEach(dayNumber => {
      const day = new Date(this.year, this.month, dayNumber).getDay();

      const row = Math.floor(day / 2);
      const col = day % 7;
      const dayName = this.weekdayNames[col];

      dayNames.push({ 'row': row, 'col': col, 'name': dayName });
    });
    return dayNames;
  }

}
