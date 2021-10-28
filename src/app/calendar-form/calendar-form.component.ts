import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarService } from '../services/calendar.service';
import { CalendarHelper } from '../helpers/calendar-helper';

@Component({
  selector: 'app-calendar-form',
  templateUrl: './calendar-form.component.html',
  styleUrls: ['./calendar-form.component.css']
})
export class CalendarFormComponent implements OnInit, OnDestroy {
  currentRecord: { what: string; hour: number; minute: number; day: number; month: number; year: number; id: string; description: string};

  profileForm = this.fb.group({
    what: ['', Validators.required],
    description: ['', Validators.required],
    hour: [0, [Validators.required, Validators.pattern("^(0[0-9]|[0-9]|1[0-9]|2[0-3])$")]],
    minute: [0, [Validators.required, Validators.pattern("^(0[0-9]|[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])$")]],
    month: [],
    year: [],
    day: [],
    id: []
  })

  addingEvent: boolean = false;
  updatingEvent: boolean = false;
  undoEnabled: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
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
      && (parseInt(`${this.profileForm.value.hour}`) !== parseInt(`${this.currentRecord.hour}`)
        || parseInt(`${this.profileForm.value.minute}`) !== parseInt(`${this.currentRecord.minute}`)
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

    this.profileForm.patchValue({
      what: '',
      hour: parseInt(dayData.hour ?? 0),
      minute: parseInt(dayData.minute ?? 0),
      day: parseInt(`${dayData.dayInMonthArrayIndex}`),
      month: parseInt(`${this.calendarService.month}`),
      year: parseInt(`${this.calendarService.year}`),
      id: null,
      description: ''
    });
  }

  openUpdateEventForm(record) {
    this.undoEnabled = false;
    this.updatingEvent = true

    this.currentRecord = {
      what: record.what,
      hour: parseInt(`${record.hour}`),
      minute: parseInt(`${record.minute}`),
      day: parseInt(`${record.day}`),
      month: parseInt(`${this.calendarService.month}`),
      year: parseInt(`${this.calendarService.year}`),
      id: record.id,
      description: record.description
    };

    this.profileForm.patchValue(this.currentRecord);
  }

  addEventClick() { this.postEvent(); }

  async updateEventClick() {
    if (!this.undoEnabled) alert('No changes!');
    else await this.postEvent();
  }

  async postEvent() {
    const record = new CalendarRecord();
    record.id = this.profileForm.value.id;
    record.what = this.profileForm.value.what;
    record.description = this.profileForm.value.description;
    record.year = this.calendarService.year;
    record.month = this.calendarService.month;
    record.day = this.profileForm.value.day;
    record.hour = this.profileForm.value.hour;
    record.minute = this.profileForm.value.minute;

    //todo await
    if (this.profileForm.value.id === null) {
      await this.calendarService.postCalendarRecord(record);
    }
    else {
      await this.calendarService.updateCalendarRecord(record);
    }

    this.closeAddOrUpdateEventForm();
  }

  deleteEvent() {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      //todo await
      this.calendarService.deleteCalendarRecord(this.profileForm.value.id);
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
