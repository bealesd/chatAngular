import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CalendarRecord } from './../models/calendar-record.model';
import { CalendarService } from '../services/calendar.service';

import { parseISO, format } from 'date-fns';

@Component({
  selector: 'app-calendar-form',
  templateUrl: './calendar-form.component.html',
  styleUrls: ['./calendar-form.component.css']
})
export class CalendarFormComponent implements OnInit, OnDestroy {
  currentRecord: { id: string; what: string; description: string; time: string; date: string; };

  profileForm = this.fb.group({
    id: [],
    what: ['', Validators.required],
    description: ['', Validators.required],
    time: ['18:00', [Validators.required, Validators.pattern("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")]],
    date: ['', [Validators.required, Validators.pattern("^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$")]],
  });

  addingEvent: boolean = false;
  updatingEvent: boolean = false;
  undoEnabled: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private calendarService: CalendarService
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
      if (value.open) this.openAddEventForm(value.date);
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

  openAddEventForm(date) {
    this.undoEnabled = false;
    this.addingEvent = true;

    // const now = new Date(Date.UTC(getYear(this.calendarService.currentDate),
    //   getMonth(this.calendarService.currentDate),
    //   dayData.dayInMonthArrayIndex,
    //   dayData.hour ?? 18,
    //   dayData.minute ?? 0));

    this.profileForm.patchValue({
      id: null,
      what: '',
      description: '',
      time: format(date, 'HH:mm'),
      date: format(date, 'yyyy-MM-dd')
    });
  }

  openUpdateEventForm(record) {
    this.undoEnabled = false;
    this.updatingEvent = true;

    this.currentRecord = {
      id: record.Id,
      what: record.What,
      description: record.Description,
      time: format(record.DateTime, 'HH:mm'),
      date: format(record.DateTime, 'yyyy-MM-dd')
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
    record.Id = this.profileForm.value.id;
    record.What = this.profileForm.value.what;
    record.Description = this.profileForm.value.description;
    
    try {
      const isoDate = this.profileForm.value.date;
      const isoTime = this.profileForm.value.time;
      const date = parseISO(`${isoDate} ${isoTime}`)
      record.DateTime = date;
    } catch (error) {
      return alert('Invalid date');
    }

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
