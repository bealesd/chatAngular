import { CalendarRecord } from './../models/calendar-record.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Utilities } from '../helpers/utilities-helper';

import { CalendarRepo } from './../services/calendar.repo';
// import { MenuService } from '../services/menu.service';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-form',
  templateUrl: './calendar-form.component.html',
  styleUrls: ['./calendar-form.component.css']
})
export class CalendarFormComponent implements OnInit, OnDestroy {
  currentRecord: { what: string; hour: number; minute: number; day: number; month: number; year: number; id: string; };

  profileForm = this.fb.group({
    what: ['', Validators.required],
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
    private calendarRepo: CalendarRepo,
    private fb: FormBuilder,
    // private menuService: MenuService,
    private calendarService: CalendarService,
    private utilities: Utilities) {
  }

  ngOnInit() {
    this.subscriptions.push(
      this.profileForm.valueChanges.subscribe(() => {
        this.undoEnabled = this.checkEnableUndo();

        // if (this.undoEnabled)
        //   this.menuService.enableMenuItem('undo-click', () => { this.undoChanges(); this.menuService.hideMenu(); });
        // else
        //   this.menuService.disableMenuItem('undo-click');

        // if (this.profileForm.valid && this.addingEvent)
        //   this.menuService.enableMenuItem('save-click', () => { this.addEventClick(); this.menuService.hideMenu(); });
        // else if (this.profileForm.valid && this.updatingEvent)
        //   this.menuService.enableMenuItem('save-click', () => { this.updateEventClick(); this.menuService.hideMenu(); });
        // else
        //   this.menuService.disableMenuItem('save-click');

        // if (this.addingEvent)
        //   this.menuService.enableMenuItem('close-click', () => { this.closeClickAddEventForm(); this.menuService.hideMenu(); });
        // else if (this.updatingEvent)
        //   this.menuService.enableMenuItem('close-click', () => { this.closeClickUpdateEventForm(); this.menuService.hideMenu(); });

        // if (this.updatingEvent)
        //   this.menuService.enableMenuItem('delete-click', () => { this.deleteEvent(); this.menuService.hideMenu(); });

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

    // this.menuService.disableMenuItem('close-click');
    // this.menuService.disableMenuItem('delete-click');
    // this.menuService.disableMenuItem('undo-click');

    // this.menuService.disableMenuItem('save-click');
  }

  checkEnableUndo() {
    return this.updatingEvent
      && (parseInt(`${this.profileForm.value.hour}`) !== parseInt(`${this.currentRecord.hour}`)
        || parseInt(`${this.profileForm.value.minute}`) !== parseInt(`${this.currentRecord.minute}`)
        || this.profileForm.value.what !== this.currentRecord.what);
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
      month: parseInt(`${this.calendarService.zeroIndexedMonth}`),
      year: parseInt(`${this.calendarService.year}`),
      id: this.utilities.uuidv4()
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
      month: parseInt(`${this.calendarService.zeroIndexedMonth}`),
      year: parseInt(`${this.calendarService.year}`),
      id: record.id
    };

    this.profileForm.patchValue(this.currentRecord);
  }

  addEventClick() { this.postEvent(); }

  updateEventClick() {
    if (!this.undoEnabled) alert('No changes!');
    else this.postEvent();
  }

  postEvent() {
    const record: CalendarRecord = new CalendarRecord(
      this.profileForm.value.id,
      this.profileForm.value.what,
      parseInt(`${this.profileForm.value.day}`),
      parseInt(`${this.profileForm.value.hour}`),
      parseInt(`${this.profileForm.value.minute}`)
    );
    //todo await
    this.calendarRepo.postCalendarRecord(record);
    this.closeAddOrUpdateEventForm();
  }

  deleteEvent() {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      //todo await
      this.calendarRepo.deleteCalendarRecord(this.profileForm.value.id);
      this.closeAddOrUpdateEventForm();
    }
  }

  closeAddOrUpdateEventForm() {
    // this.menuService.disableMenuItem('close-click');
    // this.menuService.disableMenuItem('delete-click');
    // this.menuService.disableMenuItem('save-click');

    // this.menuService.disableMenuItem('undo-click');

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
