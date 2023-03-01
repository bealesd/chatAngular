import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarService } from '../services/calendar.service';
import { CalendarHelper } from '../helpers/calendar-helper';

import { getDate, getMonth, getYear } from 'date-fns';

@Component({
  selector: 'app-calendar-form',
  templateUrl: './calendar-form.component.html',
  styleUrls: ['./calendar-form.component.css']
})
export class CalendarFormComponent implements OnInit, OnDestroy {
  currentRecord: { what: string; time: string; date: string; day: number; month: number; year: number; id: string; description: string };

  profileForm = this.fb.group({
    what: ['', Validators.required],
    description: ['', Validators.required],
    time: ['18:00', [Validators.required, Validators.pattern("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")]],
    date: ['', [Validators.required, Validators.pattern("^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$")]],
    month: [],
    year: [],
    day: [],
    id: []
  });

  addingEvent: boolean = false;
  updatingEvent: boolean = false;
  undoEnabled: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private calendarService: CalendarService,
    public calendarHelper: CalendarHelper
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.profileForm.valueChanges.subscribe(() => {
        this.undoEnabled = this.checkEnableUndo();
      })
    );

    this.calendarService.closeAddOrUpdateEventForm.next(false);
    this.calendarService.openUpdateEventForm.next({});
    this.calendarService.openAddEventForm.next({});

    this.calendarService.closeAddOrUpdateEventForm.subscribe(() => {
      const close = this.calendarService.closeAddOrUpdateEventForm.getValue();
      if (close) this.closeAddOrUpdateEventForm();
    });

    this.calendarService.openUpdateEventForm.subscribe(() => {
      const value = this.calendarService.openUpdateEventForm.getValue();
      if (value.open) this.openUpdateEventForm(value.record);
    });

    this.calendarService.openAddEventForm.subscribe(() => {
      const value = this.calendarService.openAddEventForm.getValue();
      if (value.open) this.openAddEventForm(value.dayData);
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.calendarService.closeAddOrUpdateEventForm.observers.forEach(element => { element.complete(); });
    this.calendarService.closeAddOrUpdateEventForm.next(false);

    this.calendarService.openUpdateEventForm.observers.forEach(element => { element.complete(); });
    this.calendarService.openUpdateEventForm.next({});

    this.calendarService.openAddEventForm.observers.forEach(element => { element.complete(); });
    this.calendarService.openAddEventForm.next({});
  }

  checkEnableUndo() {
    return this.updatingEvent
      &&
      (this.profileForm.value.time !== this.currentRecord.time
        || this.profileForm.value.date !== this.currentRecord.date
        || this.profileForm.value.what !== this.currentRecord.what
        || this.profileForm.value.description !== this.currentRecord.description);
  }

  undoChanges() {
    if (window.confirm('Are you sure you want to undo changes?')) {
      this.profileForm.patchValue(this.currentRecord);
      this.undoEnabled = false;
    }
  }

  openAddEventForm(dayData) {
    this.undoEnabled = false;
    this.addingEvent = true;

    const now = new Date(Date.UTC(getYear(this.calendarService.currentDate), getMonth(this.calendarService.currentDate), dayData.dayInMonthArrayIndex, dayData.hour ?? 18, dayData.minute ?? 0));

    this.profileForm.patchValue({
      what: '',
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('zh-Hans-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })['replaceAll']('/', '-'),
      day: getDate(now),
      month: getMonth(now),
      year: getYear(now),
      id: null,
      description: ''
    });
  }

  openUpdateEventForm(record) {
    this.undoEnabled = false;
    this.updatingEvent = true;
    
    const now = record.dateTime;

    this.currentRecord = {
      what: record.what,
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('zh-Hans-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })['replaceAll']('/', '-'),
      day: getDate(now),
      month: getMonth(now),
      year: getYear(now),
      id: record.id,
      description: record.description
    };

    this.profileForm.patchValue(this.currentRecord);
  }

  async addEventClick() { await this.postEvent(); }

  async updateEventClick() {
    if (!this.undoEnabled) alert('No changes!');
    else await this.postEvent();
  }

  async postEvent() {
    const record = new CalendarRecord();
    record.id = this.profileForm.value.id;
    record.what = this.profileForm.value.what;
    record.description = this.profileForm.value.description;

    const year = parseInt(this.profileForm.value.date.split('-')[0]);
    // zero indexed month, so month 12 is actually 11 when used in Date type
    const month = parseInt(this.profileForm.value.date.split('-')[1]) - 1;
    const day = parseInt(this.profileForm.value.date.split('-')[2]);
    const hour = parseInt(this.profileForm.value.time.split(':')[0]);
    const minute = parseInt(this.profileForm.value.time.split(':')[1]);
    record.dateTime = new Date(year, month, day, hour, minute);

    if (this.profileForm.value.id === null)
      await this.calendarService.postCalendarRecord(record);
    else
      await this.calendarService.updateCalendarRecord(record);

    this.closeAddOrUpdateEventForm();
  }

  async deleteEvent() {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      await this.calendarService.deleteCalendarRecord(this.profileForm.value.id);
      this.closeAddOrUpdateEventForm();
    }
  }

  closeAddOrUpdateEventForm() {
    this.addingEvent = false;
    this.updatingEvent = false;
    this.undoEnabled = false;
  }

  closeClickAddEventForm() {
    if (!this.profileForm.valid)
      this.closeAddOrUpdateEventForm();
    else if (window.confirm('Are you sure you want to discard changes?'))
      this.closeAddOrUpdateEventForm();
  }

  closeClickUpdateEventForm() {
    if (!this.undoEnabled)
      this.closeAddOrUpdateEventForm();
    else if (window.confirm('Are you sure you want to discard changes?'))
      this.closeAddOrUpdateEventForm();
  }
}
