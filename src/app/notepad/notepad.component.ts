import { Notepad } from './../models/notepad-models';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { MenuService } from '../services/menu.service';
import { NotepadRepo, State } from '../services/notepad.repo'

@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  disablePage = false;
  createNotepadFormIsOpen = false;
  renameNotepadFormIsOpen = false;
  notepadIsOpen = false;
  originalNotepadText = '';

  preventSimpleClick: boolean;
  highlightedRow: string = null;
  timer: any;

  get notepadTextHasChanged() { return this.notepadRepo.currentNotepad.content !== this.originalNotepadText; }

  constructor(
    public notepadRepo: NotepadRepo,
    public menuService: MenuService,
    private loggerService: LoggerService
  ) { }

  ngOnInit(): void {
    this.disablePage = false;

    this.subscriptions.push(this.notepadRepo.state.subscribe((state) => {
      const lastState = state[state.length - 1];
      this.createNotepadFormIsOpen = false;
      this.renameNotepadFormIsOpen = false;
      this.disablePage = false;
      this.highlightedRow = null;

      //TODO this should only be done on state.get or state.save
      this.originalNotepadText = this.notepadRepo.currentNotepad.content;

      if ([undefined, State.Error, State.DeletedNotepad, State.GotNotepadListing, State.RenamedNotepad].includes(lastState)) {
        this.notepadIsOpen = false;
        this.disableNotebookMenus();
        this.loggerService.log('notepad is closed', ' info');
      }
      else {
        this.notepadIsOpen = true;
        this.loggerService.log('notepad is open', ' info');
        this.updateNotepadInput(this.originalNotepadText);
        this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('delete-click', () => { this.deleteNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('undo-click', () => { this.undoNotepadChanges(); this.menuService.hideMenu(); });
      }
    }));

    this.notepadRepo.getAllNotepads();
    this.menuService.activateRoute('notepad-click');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.disableNotebookMenus();
  }

  disableNotebookMenus() {
    this.menuService.disableMenuItem('close-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('undo-click');
  }

  undoNotepadChanges() {
    this.notepadRepo.currentNotepad.content = this.originalNotepadText;
    this.updateNotepadInput(this.originalNotepadText);
  }

  updateNotepadInput(value) {
    (document.querySelector('.notepad-text-input ') as HTMLTextAreaElement).value = value;
  }

  updateText(value) {
    this.notepadRepo.currentNotepad.content = value;
  }

  createNotepadForm() {
    this.createNotepadFormIsOpen = true;
  }

  cancelNewNotepad() {
    this.createNotepadFormIsOpen = false;
  }

  renameNotepadForm() {
    if (!this.isNotepadItemSelected) return;
    this.renameNotepadFormIsOpen = true;
  }

  cancelRenameNotepad() {
    this.renameNotepadFormIsOpen = false;
  }

  newNotepad(name) {
    this.disablePage = true;
    this.notepadRepo.postNotepad('', name, '');
  }

  openNotepad(): void {
    this.preventSimpleClick = true;
    clearTimeout(this.timer);

    if (!this.isNotepadItemSelected) return;

    this.disablePage = true;

    const notepad: Notepad = this.notepadRepo.notepads.find((np: Notepad) => {
      return np.metadata.sha === this.notepadRepo.currentNotepad.metadata.sha
        && np.metadata.name === this.notepadRepo.currentNotepad.metadata.name
    });
    // notepad is null if you've just done a delete, then try to open another file
    // why??
    this.notepadRepo.getNotepad(notepad);
  }

  highlightRow(item: Notepad): void {
    this.timer = null;
    this.preventSimpleClick = false;
    let delay = 200;

    this.timer = setTimeout(() => {
      if (!this.preventSimpleClick) {
        // this.highlightedRow = item.metadata.sha + item.metadata.name;
        this.highlightedRow = item.metadata.key;
        this.notepadRepo.currentNotepad = item;
        // this.notepadRepo.currentNotepad.metadata.name = item.metadata.name;
      }
    }, delay);
  }

  get isNotepadItemSelected() {
    if (this.stringIsNull(this.notepadRepo.currentNotepad.metadata.sha)) {
      alert('No notepad selected!');
      return false;
    }
    return true;
  }

  renameNotepad(name) {
    this.disablePage = true;
    this.notepadRepo.renameNotepad(this.notepadRepo.currentNotepad.metadata.sha, this.notepadRepo.currentNotepad.metadata.name, name);
  }

  saveNotepad() {
    this.disablePage = true;
    this.notepadRepo.postNotepad(this.notepadRepo.currentNotepad.content, this.notepadRepo.currentNotepad.metadata.name, this.notepadRepo.currentNotepad.metadata.sha);
  }

  exitNotepad() {
    if (this.notepadTextHasChanged)
      if (!window.confirm('Discard unsaved changes?')) return;

    this.disablePage = true;
    this.notepadRepo.getAllNotepads();
  }

  stringIsNull(value) { return ['', null, undefined].includes(value); }

  deleteNotepad() {
    if (!this.isNotepadItemSelected) return;

    if (window.confirm('Delete notepad?')) {
      this.notepadRepo.deleteNotepad(this.notepadRepo.currentNotepad.metadata.sha, this.notepadRepo.currentNotepad.metadata.name);
      this.disablePage = true;
    }
  }
}
