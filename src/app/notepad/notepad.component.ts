import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';
import { NotepadRepo } from '../services/notepad.repo'

@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit, OnDestroy {
  notepadIsOpen = false;
  notepadFormIsOpen = true;
  new = false;
  update = false;
  name: string;
  originalText = '';
  currentNotepadText = '';

  constructor(
    public notepadRepo: NotepadRepo,
    public menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.notepadRepo.getAllNotepads();
    this.menuService.activateRoute('notepad-click');
  }

  ngOnDestroy() {
    this.menuService.disableMenuItem('new-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('close-click');
    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('undo-click');
  }

  saveNotepad() {
    this.notepadRepo.postNotepad(this.currentNotepadText, this.name);
  }

  openNotepad(notepad) {
    this.new = false;
    this.update = true;
    this.notepadIsOpen = true;

    this.notepadRepo.getNotepad(notepad,
      (name) => {
        this.name = name;
        this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('delete-click', () => { this.deleteNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('undo-click', () => { this.undoNotepadChanges(); this.menuService.hideMenu(); });
        this.originalText = this.notepadRepo.currentNotepad['content'];
        this.currentNotepadText = this.originalText;
      });
  }

  updateText(evt) {
    this.currentNotepadText = (evt.target as any).innerText;
  }

  get notepadTextHasChanged() {
    return this.currentNotepadText !== this.originalText;
  }

  newNotepad() {
    this.originalText = '';
    this.currentNotepadText = this.originalText;
    this.update = false;
    this.new = true;
    this.notepadFormIsOpen = false;
    this.notepadIsOpen = true;

    this.name = (document.querySelector('#value') as any).value;

    this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
    this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
  }

  exitNotepad() {
    if (this.notepadTextHasChanged)
      if (!window.confirm('Discard unsaved changes?')) return;

    this.originalText = '';
    this.update = false;
    this.new = false;
    this.notepadFormIsOpen = true;
    this.notepadIsOpen = false;

    this.menuService.disableMenuItem('close-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('undo-click');
  }

  deleteNotepad() {
    if (window.confirm('Delete notepad?')) {
      this.notepadRepo.deleteNotepad(this.name);

      this.originalText = '';
      this.update = false;
      this.new = false;
      this.notepadFormIsOpen = true;
      this.notepadIsOpen = false;

      this.menuService.disableMenuItem('close-click');
      this.menuService.disableMenuItem('save-click');
      this.menuService.disableMenuItem('delete-click');
      this.menuService.disableMenuItem('undo-click');
    }
  }

  undoNotepadChanges() {
    this.currentNotepadText = this.originalText;
  }
}
