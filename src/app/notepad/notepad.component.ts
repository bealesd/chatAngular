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
    this.menuService.disableMenuItem('exit-click');
  }

  saveNotepad() {
    const content = (document.querySelector('.notepad-text-input') as any).innerText;
    this.notepadRepo.postNotepad(content, this.name);
  }

  openNotepad(notepad) {
    this.new = false;

    this.update = true;
    this.notepadIsOpen = false;
    this.notepadRepo.getNotepad(notepad, (name) => {
      this.notepadIsOpen = true;
      this.name = name;
      this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
      this.menuService.enableMenuItem('exit-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
    });
  }

  newNotepadForm() {
    this.notepadFormIsOpen = true;
  }

  newNotepad() {
    this.update = false;
    this.new = true;

    this.notepadFormIsOpen = false;
    this.notepadIsOpen = true;
    this.name = (document.querySelector('#value') as any).value;

    this.menuService.enableMenuItem('save-click', () => { this.saveNotepad(); this.menuService.hideMenu(); });
    this.menuService.enableMenuItem('exit-click', () => { this.exitNotepad(); this.menuService.hideMenu(); });
  }

  exitNotepad(){
    this.update = false;
    this.new = false;
    this.notepadFormIsOpen = false;
    this.notepadIsOpen = false;

    this.menuService.disableMenuItem('exit-click');
    this.menuService.disableMenuItem('save-click');
  }

}
