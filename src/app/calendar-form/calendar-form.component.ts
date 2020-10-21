import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as uuid from 'uuid';

import { LoginHelper } from '../helpers/login-helper';
import { CalendarRepo } from './../services/calendar.repo';
import { MenuService } from '../services/menu.service';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-calendar-form',
  templateUrl: './calendar-form.component.html',
  styleUrls: ['./calendar-form.component.css']
})
export class CalendarFormComponent implements OnInit {
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
    private loginHelper: LoginHelper,
    private fb: FormBuilder,
    private menuService: MenuService,
    private calendarService: CalendarService) { }

    ngOnInit() {

      this.subscriptions.push(
        this.profileForm.valueChanges.subscribe(() => {
          this.undoEnabled = this.checkEnableUndo();
  
          if (this.undoEnabled)
            this.menuService.enableMenuItem('undo-click', () => { this.undoChanges(); this.menuService.hideMenu(); });
          else
            this.menuService.disableMenuItem('undo-click');
  
          if (this.profileForm.valid && this.addingEvent)
            this.menuService.enableMenuItem('save-click', () => { this.addEventClick(); this.menuService.hideMenu(); });
          else if (this.profileForm.valid && this.updatingEvent)
            this.menuService.enableMenuItem('save-click', () => { this.updateEventClick(); this.menuService.hideMenu(); });
          else
            this.menuService.disableMenuItem('save-click');
  
          if (this.addingEvent)
            this.menuService.enableMenuItem('cancel-click', () => { this.closeClickAddEventForm(); this.menuService.hideMenu(); });
          else if (this.updatingEvent)
            this.menuService.enableMenuItem('cancel-click', () => { this.closeClickUpdateEventForm(); this.menuService.hideMenu(); });
  
          if (this.updatingEvent)
            this.menuService.enableMenuItem('delete-click', () => { this.deleteEvent(); this.menuService.hideMenu(); });
        })
      );

      this.calendarService.closeAddOrUpdateEventForm.subscribe(()=>{
        const close = this.calendarService.closeAddOrUpdateEventForm.getValue();
        if (close)
          this.closeAddOrUpdateEventForm();
      });

      this.calendarService.openUpdateEventForm.subscribe(()=>{
        const value = this.calendarService.openUpdateEventForm.getValue();
        if (value.open)
          this.openUpdateEventForm(value.record);
      });

      this.calendarService.openAddEventForm.subscribe(()=>{
        const value = this.calendarService.openAddEventForm.getValue();
        if (value.open)
          this.openAddEventForm(value.dayData);
      });


    }

    getDayNameLongForMonth(day) {
      const date = new Date(this.calendarService.year, this.calendarService.zeroIndexedMonth, day);
      return this.getDayNameLong(date.getDay());
    }

    getDayNameLong(dayNumber) {
      return Object.keys(this.calendarService.daysLongEnum)[dayNumber];
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

    openAddEventForm(dayData) {
      this.undoEnabled = false;
      this.addingEvent = true;
  
      this.profileForm.patchValue({
        what: '',
        hour: 0,
        minute: 0,
        day: dayData.dayInMonthArrayIndex,
        month: this.calendarService.zeroIndexedMonth,
        year: this.calendarService.year,
        id: uuid()
      });
    }
  
    openUpdateEventForm(record) {
      this.undoEnabled = false;
      this.updatingEvent = true
  
      this.currentRecord = {
        what: record.what,
        hour: record.hour,
        minute: record.minute,
        day: record.day,
        month: this.calendarService.zeroIndexedMonth,
        year: this.calendarService.year,
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
      this.calendarRepo.postCalendarRecord(this.profileForm.value.year, this.profileForm.value.month, record);
      this.closeAddOrUpdateEventForm();
    }
  
    deleteEvent() {
      if (window.confirm(`Are you sure you want to delete this record?`)) {
        this.calendarRepo.deleteCalendarRecord(this.profileForm.value.year, this.profileForm.value.month, this.profileForm.value.id);
        this.closeAddOrUpdateEventForm();
      }
    }
  
    closeAddOrUpdateEventForm() {
      this.menuService.disableMenuItem('cancel-click');
      this.menuService.disableMenuItem('delete-click');
      this.menuService.disableMenuItem('save-click');
  
      this.menuService.disableMenuItem('undo-click');
  
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

    ngOnDestroy() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
  
      this.calendarRepo.calendarRecords.observers.forEach(element => { element.complete(); });
      this.calendarRepo.calendarRecords.next({});
  
      this.menuService.disableMenuItem('cancel-click');
      this.menuService.disableMenuItem('delete-click');
      this.menuService.disableMenuItem('undo-click');
  
      this.menuService.disableMenuItem('save-click');
    }

}
