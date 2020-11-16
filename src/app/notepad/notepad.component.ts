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
  notepadFormIsOpen = false;
  new = false;
  update = false;
  name: string;
  originalText = '';

  constructor(
    public notepadRepo: NotepadRepo,
    public menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.notepadRepo.getAllNotepads();
    this.menuService.activateRoute('notepad-click');

    this.menuService.enableMenuItem('new-click', () => { this.newNotepadForm(); this.menuService.hideMenu(); });
  }

  ngOnDestroy() {
    this.menuService.disableMenuItem('new-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('close-click');
  }

  saveNotepad() {
    this.notepadRepo.postNotepad(this.notepadText, this.name);
  }

  openNotepad(notepad) {
    this.new = false;

    this.update = true;
    this.notepadIsOpen = false;
    this.notepadRepo.getNotepad(notepad,
      (name, text) => {
        this.notepadIsOpen = true;
        this.name = name;
        this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
        this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
        this.originalText = text;
      });
  }

  get notepadText() {
    return (document.querySelector('.notepad-text-input') as any).innerText;
  }

  get notepadTextHasChanged() {
    return this.notepadText !== this.originalText;
  }

  newNotepadForm() {
    if ((this.update || this.new) && this.notepadTextHasChanged) { 
      if(window.confirm('Discard unsaved changes?')) {
        this.notepadFormIsOpen = true;
        this.originalText = '';
      }
    }    
  }

  newNotepad() {
    this.update = false;
    this.new = true;

    this.notepadFormIsOpen = false;
    this.notepadIsOpen = true;
    this.name = (document.querySelector('#value') as any).value;

    this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
    this.menuService.enableMenuItem('close-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
  }

  exitNotepad() {
    if (this.notepadTextHasChanged) { 
      if(window.confirm('Discard unsaved changes?')) {
        this.originalText = '';
        this.update = false;
        this.new = false;
        this.notepadFormIsOpen = false;
        this.notepadIsOpen = false;
    
        this.menuService.disableMenuItem('close-click');
        this.menuService.disableMenuItem('save-click');
      }
    }
  }
}
